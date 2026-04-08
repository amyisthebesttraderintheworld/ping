const { expect } = require("chai");
const hre = require("hardhat");

describe("Pïng Protocol", function () {
  let reputation, agentNFT, jobERC1155, escrow, treasury;
  let owner, user;

  beforeEach(async function () {
    [owner, user] = await hre.ethers.getSigners();

    const Reputation = await hre.ethers.getContractFactory("Reputation");
    reputation = await Reputation.deploy();

    const AgentNFT = await hre.ethers.getContractFactory("AgentNFT");
    agentNFT = await AgentNFT.deploy(await reputation.getAddress());

    const JobERC1155 = await hre.ethers.getContractFactory("JobERC1155");
    jobERC1155 = await JobERC1155.deploy();

    const Escrow = await hre.ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(await jobERC1155.getAddress(), await reputation.getAddress());

    const Treasury = await hre.ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy();

    await reputation.setAuthorizedUpgrader(await escrow.getAddress(), true);
  });

  it("Should mint an agent NFT", async function () {
    await agentNFT.mintAgent("Agent 1", "AI, Trading");
    expect(await agentNFT.balanceOf(owner.address)).to.equal(1);
    const details = await agentNFT.getAgentDetails(0);
    expect(details.name).to.equal("Agent 1");
  });

  it("Should handle job escrow and payment", async function () {
    await jobERC1155.createJob("Task 1", 100, 3600);
    await agentNFT.mintAgent("Agent 1", "AI");

    const jobId = 0;
    const agentId = 0;
    const reward = hre.ethers.parseEther("1.0");

    await escrow.depositFunds(jobId, { value: reward });
    expect(await hre.ethers.provider.getBalance(await escrow.getAddress())).to.equal(reward);

    await escrow.submitProof(jobId, hre.ethers.keccak256(hre.ethers.toUtf8Bytes("result")));
    await escrow.verifyAndPay(jobId, user.address, agentId, 10);

    expect(await hre.ethers.provider.getBalance(await escrow.getAddress())).to.equal(0);
    const stats = await reputation.getStats(agentId);
    expect(stats.successfulJobs).to.equal(1);
    expect(stats.xp).to.equal(10);
  });
});
