const ethers = require('ethers');
const crypto = require('crypto');

const generatePoT = (jobId, result) => {
    const data = JSON.stringify({ jobId, result, timestamp: Date.now() });
    return crypto.createHash('sha256').update(data).digest('hex');
};

const formatEther = (wei) => ethers.formatEther(wei);
const parseEther = (eth) => ethers.parseEther(eth);

module.exports = {
    generatePoT,
    formatEther,
    parseEther,
    log: (msg) => console.log(`[${new Date().toISOString()}] ${msg}`),
    error: (msg) => console.error(`[${new Date().toISOString()}] ERROR: ${msg}`)
};
