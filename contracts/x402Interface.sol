// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface Ix402 {
    enum UpgradeType { SKILL, COMPUTE, REPUTATION }

    function requestUpgrade(uint256 agentId, UpgradeType uType, bytes calldata data) external returns (bool);
    function allocateResources(uint256 agentId, uint256 amount) external returns (bool);
    function subcontractTask(uint256 fromAgentId, uint256 toAgentId, uint256 jobId) external returns (bool);

    event UpgradeRequested(uint256 indexed agentId, UpgradeType uType);
    event ResourcesAllocated(uint256 indexed agentId, uint256 amount);
    event TaskSubcontracted(uint256 indexed fromAgentId, uint256 indexed toAgentId, uint256 jobId);
}
