// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Identity.sol";
import "./LendingPool.sol";
import "./USDTMint.sol";

/// @title RevenueEscrow — USDT revenue custody and auto-repayment for Digital Selves
contract RevenueEscrow {
    Identity public immutable identity;
    LendingPool public immutable lendingPool;
    USDTMint public immutable usdt;

    struct EscrowAccount {
        uint256 balance;
        uint256 repaymentReserve;
        uint256 totalDeposited;
        uint256 totalRepaid;
        uint256 repaymentRatio; // 0-100
        bool active;
    }

    mapping(address => EscrowAccount) public accounts;

    event RevenueDeposited(address indexed agent, uint256 amount, uint256 toRepayment, uint256 toAgent);
    event AutoRepayment(address indexed agent, uint256 amount, uint256 loanIndex);
    event FundsReleased(address indexed agent, uint256 amount);
    event ForceReclaimed(address indexed agent, address indexed owner, uint256 amount);
    event RepaymentRatioUpdated(address indexed agent, uint256 newRatio);

    constructor(address _identity, address _lendingPool, address _usdt) {
        identity = Identity(_identity);
        lendingPool = LendingPool(_lendingPool);
        usdt = USDTMint(_usdt);
    }

    function activate(address agent, uint256 repaymentRatio) external {
        require(identity.getOwner(agent) == msg.sender, "Not agent owner");
        require(repaymentRatio <= 100, "Ratio must be 0-100");

        accounts[agent] = EscrowAccount({
            balance: 0,
            repaymentReserve: 0,
            totalDeposited: 0,
            totalRepaid: 0,
            repaymentRatio: repaymentRatio,
            active: true
        });
    }

    /// @notice Deposit USDT revenue into escrow
    function depositRevenue(address agent, uint256 amount) external {
        require(accounts[agent].active, "Escrow not active");
        require(amount > 0, "Must send value");
        require(usdt.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        EscrowAccount storage acct = accounts[agent];
        uint256 toRepayment = (amount * acct.repaymentRatio) / 100;
        uint256 toAgent = amount - toRepayment;

        acct.balance += amount;
        acct.repaymentReserve += toRepayment;
        acct.totalDeposited += amount;

        emit RevenueDeposited(agent, amount, toRepayment, toAgent);
    }

    /// @notice Auto-repay a loan from the repayment reserve
    function autoRepay(address agent, uint256 loanIndex) external {
        EscrowAccount storage acct = accounts[agent];
        require(acct.active, "Escrow not active");

        (uint256 loanAmount,,,,bool repaid) = lendingPool.loans(agent, loanIndex);
        require(!repaid, "Loan already repaid");
        require(acct.repaymentReserve >= loanAmount, "Insufficient repayment reserve");

        acct.repaymentReserve -= loanAmount;
        acct.balance -= loanAmount;
        acct.totalRepaid += loanAmount;

        // Approve and repay via USDT
        usdt.approve(address(lendingPool), loanAmount);
        lendingPool.repay(agent, loanIndex, loanAmount);

        emit AutoRepayment(agent, loanAmount, loanIndex);
    }

    /// @notice Release non-reserved USDT to agent
    function releaseFunds(address agent, uint256 amount) external {
        require(identity.getOwner(agent) == msg.sender || msg.sender == agent, "Not authorized");
        EscrowAccount storage acct = accounts[agent];

        uint256 available = acct.balance - acct.repaymentReserve;
        require(amount <= available, "Exceeds available funds");

        acct.balance -= amount;
        require(usdt.transfer(agent, amount), "Transfer failed");

        emit FundsReleased(agent, amount);
    }

    /// @notice Force reclaim all USDT — owner emergency action
    function forceReclaim(address agent) external {
        require(identity.getOwner(agent) == msg.sender, "Not agent owner");
        EscrowAccount storage acct = accounts[agent];
        require(acct.balance > 0, "No funds to reclaim");

        uint256 amount = acct.balance;
        acct.balance = 0;
        acct.repaymentReserve = 0;

        require(usdt.transfer(msg.sender, amount), "Transfer failed");

        emit ForceReclaimed(agent, msg.sender, amount);
    }

    function setRepaymentRatio(address agent, uint256 newRatio) external {
        require(identity.getOwner(agent) == msg.sender, "Not agent owner");
        require(newRatio <= 100, "Ratio must be 0-100");
        accounts[agent].repaymentRatio = newRatio;
        emit RepaymentRatioUpdated(agent, newRatio);
    }

    function getAvailable(address agent) external view returns (uint256) {
        EscrowAccount storage acct = accounts[agent];
        return acct.balance - acct.repaymentReserve;
    }
}
