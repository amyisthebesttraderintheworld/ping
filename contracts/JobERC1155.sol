// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract JobERC1155 is ERC1155, Ownable {
    uint256 private _nextTokenId;

    struct JobDetails {
        string description;
        uint256 reward;
        uint256 deadline;
        bool isCompleted;
    }

    mapping(uint256 => JobDetails) public jobDetails;

    event JobCreated(uint256 indexed jobId, string description, uint256 reward, uint256 deadline);
    event JobCompleted(uint256 indexed jobId);

    constructor() ERC1155("https://api.ping.ai/job/{id}.json") Ownable(msg.sender) {}

    function createJob(string memory description, uint256 reward, uint256 duration) external onlyOwner {
        uint256 jobId = _nextTokenId++;
        jobDetails[jobId] = JobDetails({
            description: description,
            reward: reward,
            deadline: block.timestamp + duration,
            isCompleted: false
        });

        _mint(msg.sender, jobId, 1, "");

        emit JobCreated(jobId, description, reward, jobDetails[jobId].deadline);
    }

    function markCompleted(uint256 jobId) external onlyOwner {
        require(jobDetails[jobId].deadline > block.timestamp, "Deadline passed");
        jobDetails[jobId].isCompleted = true;
        emit JobCompleted(jobId);
    }

    function getJobInfo(uint256 jobId) external view returns (string memory, uint256, uint256, bool) {
        JobDetails memory details = jobDetails[jobId];
        return (details.description, details.reward, details.deadline, details.isCompleted);
    }
}
