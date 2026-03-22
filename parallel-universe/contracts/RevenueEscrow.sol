// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Identity.sol";
import "./LendingPool.sol";

/// @title RevenueEscrow — Revenue custody and auto-repayment for Digital Selves
/// @notice Agent task revenue flows here first; auto-splits repayment vs agent funds
contract RevenueEscrow {
    Identity public immutable identity;
    LendingPool public immutable lendingPool;

    struct EscrowAccount {
        uint256 balance;           // total escrowed funds
        uint256 repaymentReserve;  // portion earmarked for repayment
        uint256 totalDeposited;    // lifetime deposits
        uint256 totalRepaid;       // lifetime repayments via escrow
        uint256 repaymentRatio;    // percentage of revenue auto-allocated to repayment (0-100)
        bool active;
    }

    mapping(address => EscrowAccount) public accounts; // agent => escrow

    event RevenueDeposited(address indexed agent, uint256 amount, uint256 toRepayment, uint256 toAgent);
    event AutoRepayment(address indexed agent, uint256 amount, uint256 loanIndex);
    event FundsReleased(address indexed agent, uint256 amount);
    event ForceReclaimed(address indexed agent, address indexed owner, uint256 amount);
    event RepaymentRatioUpdated(address indexed agent, uint256 newRatio);

    constructor(address _identity, address payable _lendingPool) {
        identity = Identity(_identity);
        lendingPool = LendingPool(_lendingPool);
    }

    /// @notice Activate escrow for an agent with a repayment ratio
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

    /// @notice Deposit revenue into escrow (called when agent earns income)
    function depositRevenue(address agent) external payable {
        require(accounts[agent].active, "Escrow not active");
        require(msg.value > 0, "Must send value");

        EscrowAccount storage acct = accounts[agent];
        uint256 toRepayment = (msg.value * acct.repaymentRatio) / 100;
        uint256 toAgent = msg.value - toRepayment;

        acct.balance += msg.value;
        acct.repaymentReserve += toRepayment;
        acct.totalDeposited += msg.value;

        emit RevenueDeposited(agent, msg.value, toRepayment, toAgent);
    }

    /// @notice Auto-repay a loan from the repayment reserve
    function autoRepay(address agent, uint256 loanIndex) external {
        EscrowAccount storage acct = accounts[agent];
        require(acct.active, "Escrow not active");

        // Get loan details
        (uint256 loanAmount,,,,bool repaid) = lendingPool.loans(agent, loanIndex);
        require(!repaid, "Loan already repaid");
        require(acct.repaymentReserve >= loanAmount, "Insufficient repayment reserve");

        acct.repaymentReserve -= loanAmount;
        acct.balance -= loanAmount;
        acct.totalRepaid += loanAmount;

        // Send to lending pool as repayment
        lendingPool.repay{value: loanAmount}(agent, loanIndex);

        emit AutoRepayment(agent, loanAmount, loanIndex);
    }

    /// @notice Release non-reserved funds to agent (agent can use freely)
    function releaseFunds(address agent, uint256 amount) external {
        require(identity.getOwner(agent) == msg.sender || msg.sender == agent, "Not authorized");
        EscrowAccount storage acct = accounts[agent];

        uint256 available = acct.balance - acct.repaymentReserve;
        require(amount <= available, "Exceeds available funds");

        acct.balance -= amount;
        payable(agent).transfer(amount);

        emit FundsReleased(agent, amount);
    }

    /// @notice Force reclaim all funds — owner emergency action when agent defaults
    function forceReclaim(address agent) external {
        require(identity.getOwner(agent) == msg.sender, "Not agent owner");
        EscrowAccount storage acct = accounts[agent];
        require(acct.balance > 0, "No funds to reclaim");

        uint256 amount = acct.balance;
        acct.balance = 0;
        acct.repaymentReserve = 0;

        payable(msg.sender).transfer(amount);

        emit ForceReclaimed(agent, msg.sender, amount);
    }

    /// @notice Update repayment ratio
    function setRepaymentRatio(address agent, uint256 newRatio) external {
        require(identity.getOwner(agent) == msg.sender, "Not agent owner");
        require(newRatio <= 100, "Ratio must be 0-100");
        accounts[agent].repaymentRatio = newRatio;
        emit RepaymentRatioUpdated(agent, newRatio);
    }

    /// @notice Get available (non-reserved) balance
    function getAvailable(address agent) external view returns (uint256) {
        EscrowAccount storage acct = accounts[agent];
        return acct.balance - acct.repaymentReserve;
    }

    receive() external payable {}
}
