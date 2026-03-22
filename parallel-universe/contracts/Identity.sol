// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Identity — Digital Self identity registry
/// @notice Binds a Digital Self (agent wallet) to a real person's ZK-verified identity
contract Identity {
    struct DigitalSelf {
        string name;
        address owner; // real person
        bytes32 zkProofHash; // hash of the ZK credit proof
        uint256 createdAt;
        bool active;
    }

    mapping(address => DigitalSelf) public digitalSelves; // agent address => DigitalSelf
    mapping(address => address[]) public ownerToAgents; // owner => list of agent addresses

    event DigitalSelfCreated(address indexed agent, address indexed owner, string name);
    event DigitalSelfDeactivated(address indexed agent, address indexed owner);
    event ZKProofBound(address indexed agent, bytes32 proofHash);

    modifier onlyOwner(address agent) {
        require(digitalSelves[agent].owner == msg.sender, "Not the owner");
        _;
    }

    modifier agentExists(address agent) {
        require(digitalSelves[agent].createdAt > 0, "Digital Self does not exist");
        _;
    }

    /// @notice Create a new Digital Self bound to the caller (real person)
    function createDigitalSelf(address agent, string calldata name) external {
        require(digitalSelves[agent].createdAt == 0, "Digital Self already exists");

        digitalSelves[agent] = DigitalSelf({
            name: name,
            owner: msg.sender,
            zkProofHash: bytes32(0),
            createdAt: block.timestamp,
            active: true
        });

        ownerToAgents[msg.sender].push(agent);

        emit DigitalSelfCreated(agent, msg.sender, name);
    }

    /// @notice Bind a ZK proof hash to a Digital Self (called after ZK verification)
    function bindZKProof(address agent, bytes32 proofHash) external onlyOwner(agent) {
        digitalSelves[agent].zkProofHash = proofHash;
        emit ZKProofBound(agent, proofHash);
    }

    /// @notice Deactivate a Digital Self (real person emergency override)
    function deactivate(address agent) external onlyOwner(agent) {
        digitalSelves[agent].active = false;
        emit DigitalSelfDeactivated(agent, msg.sender);
    }

    /// @notice Reactivate a Digital Self
    function reactivate(address agent) external onlyOwner(agent) {
        digitalSelves[agent].active = true;
    }

    /// @notice Check if a Digital Self is active and verified
    function isVerified(address agent) external view returns (bool) {
        DigitalSelf storage ds = digitalSelves[agent];
        return ds.active && ds.zkProofHash != bytes32(0);
    }

    /// @notice Get owner of a Digital Self
    function getOwner(address agent) external view returns (address) {
        return digitalSelves[agent].owner;
    }

    /// @notice Get all agent addresses owned by a person
    function getAgents(address owner) external view returns (address[] memory) {
        return ownerToAgents[owner];
    }
}
