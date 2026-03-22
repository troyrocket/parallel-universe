// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CreditScore.sol";
import "./Guardrails.sol";
import "./Identity.sol";

/// @title LendingPool — Credit-based lending with Jump Rate interest model
/// @notice Allows Digital Selves to borrow based on credit score, no collateral required
/// @dev Interest rate uses a two-slope Jump Rate model based on pool utilization
contract LendingPool {
    CreditScore public immutable creditScore;
    Guardrails public immutable guardrails;
    Identity public immutable identity;

    struct Loan {
        uint256 amount;
        uint256 interestRate; // basis points (e.g., 420 = 4.2%)
        uint256 borrowedAt;
        uint256 dueBlock;
        bool repaid;
    }

    mapping(address => Loan[]) public loans;
    mapping(address => uint256) public totalBorrowed;

    uint256 public poolBalance;       // available liquidity
    uint256 public totalOutstanding;  // total borrowed across all agents
    uint256 public reserveFunds;      // risk reserve (10% of fees)

    // Jump Rate model parameters (basis points)
    uint256 public constant BASE_RATE = 200;       // 2% base
    uint256 public constant SLOPE_LOW = 500;        // 5% slope below kink
    uint256 public constant SLOPE_HIGH = 5000;      // 50% slope above kink (steep)
    uint256 public constant KINK = 8000;            // 80% utilization kink
    uint256 public constant RESERVE_FACTOR = 1000;  // 10% of interest goes to reserve

    event LoanCreated(address indexed agent, uint256 amount, uint256 interestRate, uint256 loanIndex);
    event LoanRepaid(address indexed agent, uint256 amount, uint256 loanIndex);
    event LoanDefaulted(address indexed agent, uint256 amount, uint256 loanIndex);
    event PoolFunded(address indexed funder, uint256 amount);

    constructor(address _creditScore, address _guardrails, address _identity) {
        creditScore = CreditScore(_creditScore);
        guardrails = Guardrails(_guardrails);
        identity = Identity(_identity);
    }

    /// @notice Fund the lending pool
    function fundPool() external payable {
        require(msg.value > 0, "Must send ETH");
        poolBalance += msg.value;
        emit PoolFunded(msg.sender, msg.value);
    }

    /// @notice Current pool utilization in basis points (0-10000)
    function utilization() public view returns (uint256) {
        uint256 totalSupply = poolBalance + totalOutstanding;
        if (totalSupply == 0) return 0;
        return (totalOutstanding * 10000) / totalSupply;
    }

    /// @notice Calculate borrow rate using Jump Rate model (returns basis points)
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

    /// @notice Borrow from the pool
    function borrow(address agent, uint256 amount) external {
        require(identity.isVerified(agent), "Agent not verified");
        require(amount <= poolBalance, "Insufficient pool liquidity");

        // Check guardrails
        guardrails.recordBorrow(agent, amount);

        // Calculate interest rate
        uint256 interestRate = getEffectiveRate(agent);

        // Create loan record
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

        payable(agent).transfer(amount);

        emit LoanCreated(agent, amount, interestRate, loanIndex);
    }

    /// @notice Repay a loan
    function repay(address agent, uint256 loanIndex) external payable {
        require(loanIndex < loans[agent].length, "Loan does not exist");
        Loan storage loan = loans[agent][loanIndex];
        require(!loan.repaid, "Loan already repaid");
        require(msg.value >= loan.amount, "Insufficient repayment");

        loan.repaid = true;
        totalBorrowed[agent] -= loan.amount;
        totalOutstanding -= loan.amount;

        // Split: principal to pool, excess (interest) split between pool and reserve
        uint256 interest = msg.value > loan.amount ? msg.value - loan.amount : 0;
        uint256 toReserve = (interest * RESERVE_FACTOR) / 10000;
        uint256 toPool = msg.value - toReserve;

        poolBalance += toPool;
        reserveFunds += toReserve;

        // Record in guardrails
        guardrails.recordRepayment(agent, loan.amount);

        // Record in credit score
        if (block.number <= loan.dueBlock) {
            creditScore.recordRepayment(agent);
        } else {
            creditScore.recordDefault(agent);
        }

        emit LoanRepaid(agent, msg.value, loanIndex);
    }

    /// @notice Mark a loan as defaulted (called by collection agent or owner)
    function markDefault(address agent, uint256 loanIndex) external {
        require(loanIndex < loans[agent].length, "Loan does not exist");
        Loan storage loan = loans[agent][loanIndex];
        require(!loan.repaid, "Loan already repaid");
        require(block.number > loan.dueBlock, "Loan not yet overdue");

        loan.repaid = true; // close the loan
        totalBorrowed[agent] -= loan.amount;
        totalOutstanding -= loan.amount;
        // Loss absorbed — no funds returned to pool

        creditScore.recordDefault(agent);
        guardrails.recordRepayment(agent, 0); // clear debt tracking

        emit LoanDefaulted(agent, loan.amount, loanIndex);
    }

    /// @notice Get all loans for an agent
    function getLoans(address agent) external view returns (Loan[] memory) {
        return loans[agent];
    }

    /// @notice Get active loan count
    function getActiveLoansCount(address agent) external view returns (uint256 count) {
        Loan[] storage agentLoans = loans[agent];
        for (uint256 i = 0; i < agentLoans.length; i++) {
            if (!agentLoans[i].repaid) count++;
        }
    }

    /// @notice Pool stats
    function getPoolStats() external view returns (
        uint256 available,
        uint256 outstanding,
        uint256 reserve,
        uint256 util,
        uint256 currentRate
    ) {
        return (poolBalance, totalOutstanding, reserveFunds, utilization(), getBorrowRate());
    }

    /// @notice Credit-score-based rate floor (better score = lower floor)
    function _creditRateFloor(uint256 score) internal pure returns (uint256) {
        if (score >= 800) return 200;  // 2.0%
        if (score >= 700) return 350;  // 3.5%
        if (score >= 600) return 500;  // 5.0%
        if (score >= 500) return 750;  // 7.5%
        return 1200;                   // 12.0%
    }

    receive() external payable {
        poolBalance += msg.value;
    }
}
