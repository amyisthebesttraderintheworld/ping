require('dotenv').config();

module.exports = {
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'http://localhost:8545',
    privateKey: process.env.PRIVATE_KEY,
    contracts: {
        agentNFT: process.env.AGENT_NFT_ADDRESS,
        reputation: process.env.REPUTATION_ADDRESS,
        jobERC1155: process.env.JOB_ERC1155_ADDRESS,
        escrow: process.env.ESCROW_ADDRESS,
        treasury: process.env.TREASURY_ADDRESS
    },
    apiKeys: {
        openai: process.env.OPENAI_API_KEY,
        phemex: process.env.PHEMEX_API_KEY,
        phemexSecret: process.env.PHEMEX_API_SECRET
    },
    reinvestmentPercentage: 0.2, // 20% of earnings reinvested into agent upgrades
    daemonInterval: 60000 // 1 minute
};
