// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Reputation.sol";

contract AgentNFT is ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;
    Reputation public reputationContract;

    struct AgentMetadata {
        string name;
        string skillTags;
        uint256 createdAt;
    }

    mapping(uint256 => AgentMetadata) public agentMetadata;

    event AgentMinted(uint256 indexed agentId, string name, address owner);

    constructor(address _reputationContract) ERC721(unicode"Pïng Agent", "PAGNT") Ownable(msg.sender) {
        reputationContract = Reputation(_reputationContract);
    }

    function mintAgent(string memory name, string memory skillTags) external {
        uint256 agentId = _nextTokenId++;
        _safeMint(msg.sender, agentId);

        agentMetadata[agentId] = AgentMetadata({
            name: name,
            skillTags: skillTags,
            createdAt: block.timestamp
        });

        emit AgentMinted(agentId, name, msg.sender);
    }

    function getAgentDetails(uint256 agentId) external view returns (
        string memory name,
        string memory skillTags,
        uint256 xp,
        uint256 reputationScore
    ) {
        AgentMetadata memory meta = agentMetadata[agentId];
        (xp, , ) = reputationContract.getStats(agentId);
        reputationScore = reputationContract.getReputationScore(agentId);
        return (meta.name, meta.skillTags, xp, reputationScore);
    }

    function updateSkillTags(uint256 agentId, string memory newSkillTags) external {
        require(ownerOf(agentId) == msg.sender, "Not owner");
        agentMetadata[agentId].skillTags = newSkillTags;
    }
}
