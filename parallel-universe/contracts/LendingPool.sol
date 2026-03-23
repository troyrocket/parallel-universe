// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CreditScore.sol";
import "./Guardrails.sol";
import "./Identity.sol";
import "./MockUSDT.sol";

/// @title LendingPool — Credit-based USDT lending with Jump Rate interest model
/// @notice Allows Digital Selves to borrow USDT based on credit score, no collateral required
contract LendingPool {
    CreditScore public immutable creditScore;
    Guardrails public immutable guardrails;
    Identity public immutable identity;
    MockUSDT public immutable usdt;

    struct Loan {
        uint256 amount;        // USDT amount (6 decimals)
        uint256 interestRate;  // basis points (e.g., 420 = 4.2%)
        uint256 borrowedAt;
        uint256 dueBlock;
        bool repaid;
    }

    mapping(address => Loan[]) public loans;
    mapping(address => uint256) public totalBorrowed;

    uint256 public poolBalance;       // available USDT liquidity
    uint256 public totalOutstanding;  // total USDT borrowed
    uint256 public reserveFunds;      // risk reserve

    // Jump Rate model parameters (basis points)
    uint256 public constant BASE_RATE = 200;
    uint256 public constant SLOPE_LOW = 500;
    uint256 public constant SLOPE_HIGH = 5000;
    uint256 public constant KINK = 8000;
    uint256 public constant RESERVE_FACTOR = 1000;

    event LoanCreated(address indexed agent, uint256 amount, uint256 interestRate, uint256 loanIndex);
    event LoanRepaid(address indexed agent, uint256 amount, uint256 loanIndex);
    event LoanDefaulted(address indexed agent, uint256 amount, uint256 loanIndex);
    event PoolFunded(address indexed funder, uint256 amount);

    constructor(address _creditScore, address _guardrails, address _identity, address _usdt) {
        creditScore = CreditScore(_creditScore);
        guardrails = Guardrails(_guardrails);
        identity = Identity(_identity);
        usdt = MockUSDT(_usdt);
    }

    /// @notice Fund the lending pool with USDT
    function fundPool(uint256 amount) external {
        require(amount > 0, "Must send USDT");
        require(usdt.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        poolBalance += amount;
        emit PoolFunded(msg.sender, amount);
    }

    /// @notice Current pool utilization in basis points (0-10000)
    function utilization() public view returns (uint256) {
        uint256 total = poolBalance + totalOutstanding;
        if (total == 0) return 0;
        return (totalOutstanding * 10000) / total;
    }

    /// @notice Calculate borrow rate using Jump Rate model
    function getBorrowRate() public view returns (uint256) {
        uint256 util = utilization();
        if (util <= KINK) {
            return BASE_RATE + (SLOPE_LOW * util) / 10000;
        } else {
            uint256 normalRate = BASE_RATE + (SLOPE_LOW * KINK) / 10000;
            uint256 excessUtil = util - KINK;
            return normalRate + (SLOPE_HIGH * excessUtil) / 10000;
        }
    }

    /// @notice Effective rate = max(Jump Rate, credit-adjusted floor)
    function getEffectiveRate(address agent) public view returns (uint256) {
        uint256 poolRate = getBorrowRate();
        uint256 score = creditScore.getCompositeScore(agent);
        uint256 creditFloor = _creditRateFloor(score);
        return poolRate > creditFloor ? poolRate : creditFloor;
    }

    /// @notice Borrow USDT from the pool
    function borrow(address agent, uint256 amount) external {
        require(identity.isVerified(agent), "Agent not verified");
        require(amount <= poolBalance, "Insufficient pool liquidity");

        guardrails.recordBorrow(agent, amount);

        uint256 interestRate = getEffectiveRate(agent);

        uint256 loanIndex = loans[agent].length;
        loans[agent].push(Loan({
            amount: amount,
            interestRate: interestRate,
            borrowedAt: block.timestamp,
            dueBlock: block.number + 100,
            repaid: false
        }));

        totalBorrowed[agent] += amount;
        totalOutstanding += amount;
        poolBalance -= amount;

        require(usdt.transfer(agent, amount), "USDT transfer failed");

        emit LoanCreated(agent, amount, interestRate, loanIndex);
    }

    /// @notice Repay a loan in USDT
    function repay(address agent, uint256 loanIndex, uint256 repayAmount) external {
        require(loanIndex < loans[agent].length, "Loan does not exist");
        Loan storage loan = loans[agent][loanIndex];
        require(!loan.repaid, "Loan already repaid");
        require(repayAmount >= loan.amount, "Insufficient repayment");

        require(usdt.transferFrom(msg.sender, address(this), repayAmount), "USDT transfer failed");

        loan.repaid = true;
        totalBorrowed[agent] -= loan.amount;
        totalOutstanding -= loan.amount;

        uint256 interest = repayAmount > loan.amount ? repayAmount - loan.amount : 0;
        uint256 toReserve = (interest * RESERVE_FACTOR) / 10000;

        poolBalance += repayAmount - toReserve;
        reserveFunds += toReserve;

        guardrails.recordRepayment(agent, loan.amount);

        if (block.number <= loan.dueBlock) {
            creditScore.recordRepayment(agent);
        } else {
            creditScore.recordDefault(agent);
        }

        emit LoanRepaid(agent, repayAmount, loanIndex);
    }

    /// @notice Mark a loan as defaulted
    function markDefault(address agent, uint256 loanIndex) external {
        require(loanIndex < loans[agent].length, "Loan does not exist");
        Loan storage loan = loans[agent][loanIndex];
        require(!loan.repaid, "Loan already repaid");
        require(block.number > loan.dueBlock, "Loan not yet overdue");

        loan.repaid = true;
        totalBorrowed[agent] -= loan.amount;
        totalOutstanding -= loan.amount;

        creditScore.recordDefault(agent);
        guardrails.recordRepayment(agent, 0);

        emit LoanDefaulted(agent, loan.amount, loanIndex);
    }

    function getLoans(address agent) external view returns (Loan[] memory) {
        return loans[agent];
    }

    function getActiveLoansCount(address agent) external view returns (uint256 count) {
        Loan[] storage agentLoans = loans[agent];
        for (uint256 i = 0; i < agentLoans.length; i++) {
            if (!agentLoans[i].repaid) count++;
        }
    }

    function getPoolStats() external view returns (
        uint256 available,
        uint256 outstanding,
        uint256 reserve,
        uint256 util,
        uint256 currentRate
    ) {
        return (poolBalance, totalOutstanding, reserveFunds, utilization(), getBorrowRate());
    }

    function _creditRateFloor(uint256 score) internal pure returns (uint256) {
        if (score >= 800) return 200;
        if (score >= 700) return 350;
        if (score >= 600) return 500;
        if (score >= 500) return 750;
        return 1200;
    }
}
