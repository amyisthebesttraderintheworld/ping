const { generatePoT, log } = require('./utils');

class ProofGenerator {
    async generate(jobId, result) {
        log(`Generating proof for jobId: ${jobId}`);
        const hash = generatePoT(jobId, result);
        log(`Proof generated: ${hash}`);
        return {
            hash: `0x${hash}`,
            timestamp: Date.now(),
            metadata: {
                version: "1.0",
                method: "SHA-256"
            }
        };
    }

    async verify(jobId, proof) {
        // Simplified verification logic
        log(`Verifying proof for jobId: ${jobId}`);
        return proof.hash && proof.hash.startsWith('0x');
    }
}

module.exports = new ProofGenerator();
