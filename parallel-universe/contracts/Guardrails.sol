// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CreditScore.sol";
import "./Identity.sol";

/// @title Guardrails — Behavioral safety constraints for Digital Selves
/// @notice Enforces spending limits, per-tx caps, and anomaly detection
contract Guardrails {
    CreditScore public immutable creditScore;
    Identity public immutable identity;

    struct Rules {
        uint256 maxBorrowLimit; // max total outstanding borrow (USDT, 6 decimals)
        uint256 perTxCap; // max single transaction amount
        uint256 dailyLimit; // max daily spending
        uint256 dailySpent; // amount spent today
        uint256 dayStartTimestamp; // start of current day
        bool frozen; // emergency freeze by owner
    }

    mapping(address => Rules) public agentRules;
    mapping(address => uint256) public outstandingDebt; // agent => total outstanding

    event GuardrailSet(address indexed agent, uint256 maxBorrow, uint256 perTxCap, uint256 dailyLimit);
    event BorrowApproved(address indexed agent, uint256 amount);
    event BorrowDenied(address indexed agent, uint256 amount, string reason);
    event AgentFrozen(address indexed agent);
    event AgentUnfrozen(address indexed agent);
    event DebtRecorded(address indexed agent, uint256 amount);
    event DebtRepaid(address indexed agent, uint256 amount);

    constructor(address _creditScore, address _identity) {
        creditScore = CreditScore(_creditScore);
        identity = Identity(_identity);
    }

    /// @notice Set guardrail rules for a Digital Self (called by owner)
    function setRules(
        address agent,
        uint256 maxBorrow,
        uint256 perTxCap,
        uint256 dailyLimit
    ) external {
        require(identity.getOwner(agent) == msg.sender, "Not agent owner");

        agentRules[agent] = Rules({
            maxBorrowLimit: maxBorrow,
            perTxCap: perTxCap,
            dailyLimit: dailyLimit,
            dailySpent: 0,
            dayStartTimestamp: block.timestamp,
            frozen: false
        });

        emit GuardrailSet(agent, maxBorrow, perTxCap, dailyLimit);
    }

    /// @notice Check if a borrow is allowed and return reason if denied
    function checkBorrow(address agent, uint256 amount) public view returns (bool allowed, string memory reason) {
        Rules storage rules = agentRules[agent];

        // Check frozen
        if (rules.frozen) {
            return (false, "Agent is frozen by owner");
        }

        // Check identity
        if (!identity.isVerified(agent)) {
            return (false, "Agent not verified");
        }

        // Check credit-based capacity
        uint256 capacity = creditScore.getBorrowingCapacity(agent);
        if (outstandingDebt[agent] + amount > capacity) {
            return (false, "Exceeds credit-based borrowing capacity");
        }

        // Check max borrow limit (owner-set guardrail)
        if (rules.maxBorrowLimit > 0 && outstandingDebt[agent] + amount > rules.maxBorrowLimit) {
            return (false, "Exceeds max borrow limit");
        }

        // Check per-tx cap
        if (rules.perTxCap > 0 && amount > rules.perTxCap) {
            return (false, "Exceeds per-transaction cap");
        }

        // Check daily limit
        if (rules.dailyLimit > 0) {
            uint256 todaySpent = _getTodaySpent(agent);
            if (todaySpent + amount > rules.dailyLimit) {
                return (false, "Exceeds daily spending limit");
            }
        }

        return (true, "");
    }

    /// @notice Record a new borrow (called by LendingPool)
    function recordBorrow(address agent, uint256 amount) external {
        (bool allowed, string memory reason) = checkBorrow(agent, amount);
        require(allowed, reason);

        outstandingDebt[agent] += amount;

        // Update daily spending
        Rules storage rules = agentRules[agent];
        if (block.timestamp - rules.dayStartTimestamp >= 1 days) {
            rules.dayStartTimestamp = block.timestamp;
            rules.dailySpent = amount;
        } else {
            rules.dailySpent += amount;
        }

        emit DebtRecorded(agent, amount);
        emit BorrowApproved(agent, amount);
    }

    /// @notice Record a repayment (called by LendingPool)
    function recordRepayment(address agent, uint256 amount) external {
        if (outstandingDebt[agent] >= amount) {
            outstandingDebt[agent] -= amount;
        } else {
            outstandingDebt[agent] = 0;
        }
        emit DebtRepaid(agent, amount);
    }

    /// @notice Emergency freeze (owner only)
    function freeze(address agent) external {
        require(identity.getOwner(agent) == msg.sender, "Not agent owner");
        agentRules[agent].frozen = true;
        emit AgentFrozen(agent);
    }

    /// @notice Unfreeze (owner only)
    function unfreeze(address agent) external {
        require(identity.getOwner(agent) == msg.sender, "Not agent owner");
        agentRules[agent].frozen = false;
        emit AgentUnfrozen(agent);
    }

    function _getTodaySpent(address agent) internal view returns (uint256) {
        Rules storage rules = agentRules[agent];
        if (block.timestamp - rules.dayStartTimestamp >= 1 days) {
            return 0;
        }
        return rules.dailySpent;
    }
}
