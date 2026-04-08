// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./JobERC1155.sol";
import "./Reputation.sol";

contract Escrow is Ownable {
    JobERC1155 public jobContract;
    Reputation public reputationContract;

    struct TaskProof {
        bytes32 proofHash;
        uint256 submittedAt;
        bool verified;
    }

    mapping(uint256 => TaskProof) public taskProofs;
    mapping(uint256 => uint256) public jobBalances;

    event FundsDeposited(uint256 indexed jobId, uint256 amount);
    event ProofSubmitted(uint256 indexed jobId, bytes32 proofHash);
    event FundsReleased(uint256 indexed jobId, address indexed worker, uint256 amount);

    constructor(address _jobContract, address _reputationContract) Ownable(msg.sender) {
        jobContract = JobERC1155(_jobContract);
        reputationContract = Reputation(_reputationContract);
    }

    function depositFunds(uint256 jobId) external payable onlyOwner {
        jobBalances[jobId] += msg.value;
        emit FundsDeposited(jobId, msg.value);
    }

    function submitProof(uint256 jobId, bytes32 proofHash) external {
        // Simplified: only authorized agents or systems can submit
        // In reality, this would be the agent NFT owner or a trusted relayer
        taskProofs[jobId] = TaskProof({
            proofHash: proofHash,
            submittedAt: block.timestamp,
            verified: false
        });
        emit ProofSubmitted(jobId, proofHash);
    }

    function verifyAndPay(uint256 jobId, address payable worker, uint256 agentId, uint256 xpReward) external onlyOwner {
        require(!taskProofs[jobId].verified, "Already verified");
        require(jobBalances[jobId] > 0, "No funds");

        taskProofs[jobId].verified = true;
        uint256 amount = jobBalances[jobId];
        jobBalances[jobId] = 0;

        jobContract.markCompleted(jobId);
        reputationContract.recordResult(agentId, true, xpReward);

        (bool success, ) = worker.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(jobId, worker, amount);
    }
}
