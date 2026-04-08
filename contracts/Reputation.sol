// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Reputation is Ownable {
    struct Stats {
        uint256 xp;
        uint256 successfulJobs;
        uint256 failedJobs;
        uint256 lastUpdate;
    }

    mapping(uint256 => Stats) public agentStats;
    mapping(address => bool) public authorizedupgraders;

    event ReputationUpdated(uint256 indexed agentId, uint256 xp, uint256 successfulJobs, uint256 failedJobs);

    constructor() Ownable(msg.sender) {}

    modifier onlyAuthorized() {
        require(msg.sender == owner() || authorizedupgraders[msg.sender], "Not authorized");
        _;
    }

    function setAuthorizedUpgrader(address upgrader, bool status) external onlyOwner {
        authorizedupgraders[upgrader] = status;
    }

    function recordResult(uint256 agentId, bool success, uint256 xpReward) external onlyAuthorized {
        Stats storage stats = agentStats[agentId];
        if (success) {
            stats.successfulJobs += 1;
            stats.xp += xpReward;
        } else {
            stats.failedJobs += 1;
        }
        stats.lastUpdate = block.timestamp;

        emit ReputationUpdated(agentId, stats.xp, stats.successfulJobs, stats.failedJobs);
    }

    function getStats(uint256 agentId) external view returns (uint256 xp, uint256 successfulJobs, uint256 failedJobs) {
        Stats storage stats = agentStats[agentId];
        return (stats.xp, stats.successfulJobs, stats.failedJobs);
    }

    function getReputationScore(uint256 agentId) external view returns (uint256) {
        Stats storage stats = agentStats[agentId];
        uint256 totalJobs = stats.successfulJobs + stats.failedJobs;
        if (totalJobs == 0) return 0;
        return (stats.successfulJobs * 100) / totalJobs;
    }
}
