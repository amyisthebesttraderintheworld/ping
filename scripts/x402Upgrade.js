const hre = require("hardhat");
const db = require("../backend/db");
const autoUpgrade = require("../x402/autoUpgrade");

async function main() {
  console.log("Checking for autonomous agent upgrades...");
  
  const agents = db.get('agents');
  for (const agentId of Object.keys(agents)) {
    console.log(`Analyzing agent ${agentId}`);
    await autoUpgrade.checkUpgrades(agentId);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
