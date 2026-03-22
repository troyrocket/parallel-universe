// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Identity.sol";

/// @title CreditScore — Dual-layer credit scoring protocol
/// @notice Computes a composite credit score from off-chain ZK base + on-chain behavior
contract CreditScore {
    Identity public immutable identity;

    struct CreditProfile {
        uint256 zkBaseScore; // off-chain credit score (0-900), set via ZK proof
        uint256 onChainScore; // on-chain behavior score (0-900)
        uint256 offChainWeight; // weight of off-chain score (0-100, represents %)
        uint256 totalLoans; // total number of loans taken
        uint256 repaidOnTime; // number of loans repaid on time
        uint256 defaulted; // number of defaulted loans
        uint256 lastUpdated;
    }

    mapping(address => CreditProfile) public profiles;

    uint256 public constant MAX_SCORE = 900;
    uint256 public constant INITIAL_OFFCHAIN_WEIGHT = 100; // 100% off-chain at start
    uint256 public constant MIN_OFFCHAIN_WEIGHT = 20; // minimum 20% off-chain
    uint256 public constant WEIGHT_SHIFT_PER_LOAN = 10; // shift 10% per successful repayment

    event CreditInitialized(address indexed agent, uint256 zkBaseScore, uint256 compositeScore);
    event CreditUpdated(address indexed agent, uint256 newOnChainScore, uint256 newComposite, uint256 offChainWeight);
    event CreditDowngraded(address indexed agent, uint256 newOnChainScore, string reason);

    modifier onlyVerified(address agent) {
        require(identity.isVerified(agent), "Agent not verified");
        _;
    }

    constructor(address _identity) {
        identity = Identity(_identity);
    }

    /// @notice Initialize credit for a Digital Self after ZK verification
    /// @param agent The Digital Self's address
    /// @param zkScore The off-chain credit score verified via ZK proof (0-900)
    function initializeCredit(address agent, uint256 zkScore) external {
        require(identity.getOwner(agent) == msg.sender, "Not agent owner");
        require(identity.isVerified(agent), "Agent not verified");
        require(profiles[agent].lastUpdated == 0, "Credit already initialized");
        require(zkScore <= MAX_SCORE, "Score exceeds maximum");

        profiles[agent] = CreditProfile({
            zkBaseScore: zkScore,
            onChainScore: 0,
            offChainWeight: INITIAL_OFFCHAIN_WEIGHT,
            totalLoans: 0,
            repaidOnTime: 0,
            defaulted: 0,
            lastUpdated: block.timestamp
        });

        emit CreditInitialized(agent, zkScore, zkScore);
    }

    /// @notice Record a successful loan repayment — updates on-chain score and shifts weights
    function recordRepayment(address agent) external {
        CreditProfile storage p = profiles[agent];
        require(p.lastUpdated > 0, "Credit not initialized");

        p.totalLoans += 1;
        p.repaidOnTime += 1;

        // Increase on-chain score based on repayment history
        uint256 repaymentRate = (p.repaidOnTime * 100) / p.totalLoans;
        p.onChainScore = (repaymentRate * MAX_SCORE) / 100;
        if (p.onChainScore > MAX_SCORE) p.onChainScore = MAX_SCORE;

        // Shift weight toward on-chain
        if (p.offChainWeight > MIN_OFFCHAIN_WEIGHT) {
            if (p.offChainWeight > WEIGHT_SHIFT_PER_LOAN + MIN_OFFCHAIN_WEIGHT) {
                p.offChainWeight -= WEIGHT_SHIFT_PER_LOAN;
            } else {
                p.offChainWeight = MIN_OFFCHAIN_WEIGHT;
            }
        }

        p.lastUpdated = block.timestamp;

        emit CreditUpdated(agent, p.onChainScore, getCompositeScore(agent), p.offChainWeight);
    }

    /// @notice Record a loan default — downgrades on-chain score
    function recordDefault(address agent) external {
        CreditProfile storage p = profiles[agent];
        require(p.lastUpdated > 0, "Credit not initialized");

        p.totalLoans += 1;
        p.defaulted += 1;

        // Recalculate on-chain score
        uint256 repaymentRate = p.totalLoans > 0 ? (p.repaidOnTime * 100) / p.totalLoans : 0;
        p.onChainScore = (repaymentRate * MAX_SCORE) / 100;

        p.lastUpdated = block.timestamp;

        emit CreditDowngraded(agent, p.onChainScore, "loan_default");
    }

    /// @notice Get the composite credit score
    function getCompositeScore(address agent) public view returns (uint256) {
        CreditProfile storage p = profiles[agent];
        if (p.lastUpdated == 0) return 0;

        // If no on-chain history yet, return pure ZK base score
        if (p.totalLoans == 0) {
            return p.zkBaseScore;
        }

        uint256 onChainWeight = 100 - p.offChainWeight;
        uint256 composite = (p.zkBaseScore * p.offChainWeight + p.onChainScore * onChainWeight) / 100;

        return composite > MAX_SCORE ? MAX_SCORE : composite;
    }

    /// @notice Get borrowing capacity in wei based on credit score
    function getBorrowingCapacity(address agent) external view returns (uint256) {
        uint256 score = getCompositeScore(agent);
        if (score == 0) return 0;

        // Linear mapping: score 300 → 1 ETH, score 900 → 10 ETH
        if (score < 300) return 0;

        uint256 capacity = ((score - 300) * 9 ether) / 600 + 1 ether;
        return capacity;
    }

    /// @notice Get credit scores
    function getScores(address agent) external view returns (
        uint256 zkBaseScore,
        uint256 onChainScore,
        uint256 compositeScore,
        uint256 offChainWeight
    ) {
        CreditProfile storage p = profiles[agent];
        return (p.zkBaseScore, p.onChainScore, getCompositeScore(agent), p.offChainWeight);
    }

    /// @notice Get loan history stats
    function getLoanStats(address agent) external view returns (
        uint256 totalLoans,
        uint256 repaidOnTime,
        uint256 defaulted
    ) {
        CreditProfile storage p = profiles[agent];
        return (p.totalLoans, p.repaidOnTime, p.defaulted);
    }
}
