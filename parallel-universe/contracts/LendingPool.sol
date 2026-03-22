// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CreditScore.sol";
import "./Guardrails.sol";
import "./Identity.sol";

/// @title LendingPool — Credit-based USDT lending for Digital Selves
/// @notice Allows Digital Selves to borrow USDT based on their credit score, no collateral required
contract LendingPool {
    CreditScore public immutable creditScore;
    Guardrails public immutable guardrails;
    Identity public immutable identity;

    // For demo: use a mock USDT (simple ERC20) or native ETH
    // In production: integrate with WDK USDT transfers

    struct Loan {
        uint256 amount;
        uint256 interestRate; // basis points (e.g., 420 = 4.2%)
        uint256 borrowedAt;
        uint256 dueBlock;
        bool repaid;
    }

    mapping(address => Loan[]) public loans; // agent => list of loans
    mapping(address => uint256) public totalBorrowed; // agent => total outstanding

    uint256 public poolBalance; // total USDT in the pool
    uint256 public constant BASE_INTEREST_RATE = 420; // 4.2% base APR in basis points

    event LoanCreated(address indexed agent, uint256 amount, uint256 interestRate, uint256 loanIndex);
    event LoanRepaid(address indexed agent, uint256 amount, uint256 loanIndex);
    event PoolFunded(address indexed funder, uint256 amount);

    constructor(address _creditScore, address _guardrails, address _identity) {
        creditScore = CreditScore(_creditScore);
        guardrails = Guardrails(_guardrails);
        identity = Identity(_identity);
    }

    /// @notice Fund the lending pool (anyone can deposit)
    function fundPool() external payable {
        require(msg.value > 0, "Must send ETH");
        poolBalance += msg.value;
        emit PoolFunded(msg.sender, msg.value);
    }

    /// @notice Borrow from the pool (called by agent or on behalf of agent)
    /// @param agent The Digital Self borrowing
    /// @param amount Amount to borrow (in wei for demo, USDT decimals in production)
    function borrow(address agent, uint256 amount) external {
        require(identity.isVerified(agent), "Agent not verified");
        require(amount <= poolBalance, "Insufficient pool liquidity");

        // Check guardrails
        guardrails.recordBorrow(agent, amount);

        // Calculate interest rate based on credit score
        uint256 score = creditScore.getCompositeScore(agent);
        uint256 interestRate = _calculateInterestRate(score);

        // Create loan record
        uint256 loanIndex = loans[agent].length;
        loans[agent].push(Loan({
            amount: amount,
            interestRate: interestRate,
            borrowedAt: block.timestamp,
            dueBlock: block.number + 100, // ~100 blocks for demo
            repaid: false
        }));

        totalBorrowed[agent] += amount;
        poolBalance -= amount;

        // Transfer ETH to agent (simulating USDT transfer)
        payable(agent).transfer(amount);

        emit LoanCreated(agent, amount, interestRate, loanIndex);
    }

    /// @notice Repay a loan
    /// @param agent The Digital Self repaying
    /// @param loanIndex Which loan to repay
    function repay(address agent, uint256 loanIndex) external payable {
        require(loanIndex < loans[agent].length, "Loan does not exist");
        Loan storage loan = loans[agent][loanIndex];
        require(!loan.repaid, "Loan already repaid");
        require(msg.value >= loan.amount, "Insufficient repayment");

        loan.repaid = true;
        totalBorrowed[agent] -= loan.amount;
        poolBalance += msg.value; // includes any interest

        // Record in guardrails
        guardrails.recordRepayment(agent, loan.amount);

        // Record in credit score — on-time if before due block
        if (block.number <= loan.dueBlock) {
            creditScore.recordRepayment(agent);
        } else {
            creditScore.recordDefault(agent);
        }

        emit LoanRepaid(agent, msg.value, loanIndex);
    }

    /// @notice Get all loans for an agent
    function getLoans(address agent) external view returns (Loan[] memory) {
        return loans[agent];
    }

    /// @notice Get number of active (unrepaid) loans
    function getActiveLoansCount(address agent) external view returns (uint256 count) {
        Loan[] storage agentLoans = loans[agent];
        for (uint256 i = 0; i < agentLoans.length; i++) {
            if (!agentLoans[i].repaid) count++;
        }
    }

    /// @notice Calculate interest rate based on credit score (higher score = lower rate)
    function _calculateInterestRate(uint256 score) internal pure returns (uint256) {
        if (score >= 800) return 200; // 2.0% — excellent
        if (score >= 700) return 350; // 3.5% — good
        if (score >= 600) return 500; // 5.0% — fair
        if (score >= 500) return 750; // 7.5% — poor
        return 1200; // 12.0% — very poor
    }
}
