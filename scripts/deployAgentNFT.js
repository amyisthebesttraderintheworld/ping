const hre = require("hardhat");

async function main() {
  console.log("Deploying Pïng Protocol...");

  // 1. Deploy Reputation
  const Reputation = await hre.ethers.getContractFactory("Reputation");
  const reputation = await Reputation.deploy();
  await reputation.waitForDeployment();
  console.log("Reputation deployed to:", await reputation.getAddress());

  // 2. Deploy AgentNFT
  const AgentNFT = await hre.ethers.getContractFactory("AgentNFT");
  const agentNFT = await AgentNFT.deploy(await reputation.getAddress());
  await agentNFT.waitForDeployment();
  console.log("AgentNFT deployed to:", await agentNFT.getAddress());

  // 3. Deploy JobERC1155
  const JobERC1155 = await hre.ethers.getContractFactory("JobERC1155");
  const jobERC1155 = await JobERC1155.deploy();
  await jobERC1155.waitForDeployment();
  console.log("JobERC1155 deployed to:", await jobERC1155.getAddress());

  // 4. Deploy Escrow
  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(await jobERC1155.getAddress(), await reputation.getAddress());
  await escrow.waitForDeployment();
  console.log("Escrow deployed to:", await escrow.getAddress());

  // 5. Deploy Treasury
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  console.log("Treasury deployed to:", await treasury.getAddress());

  // Authorize Escrow in Reputation
  await reputation.setAuthorizedUpgrader(await escrow.getAddress(), true);
  console.log("Escrow authorized in Reputation");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
