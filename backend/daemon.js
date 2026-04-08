const config = require('./config');
const { log, error } = require('./utils');
const jobQueue = require('./jobQueue');
const apiBridge = require('./apiBridge');
const proofGenerator = require('./proofGenerator');
const agentManager = require('./agentManager');
const reputationService = require('./reputationService');

const express = require('express');

class Daemon {
    constructor() {
        this.isRunning = false;
        this.app = express();
        this.port = process.env.PORT || 3000;
    }

    setupHealthCheck() {
        this.app.get('/health', (req, res) => res.status(200).send('OK'));
        this.app.get('/', (req, res) => res.json({ status: 'running', agentCount: Object.keys(agentManager.getAgent || {}).length }));
        this.app.listen(this.port, () => log(`Health check server listening on port ${this.port}`));
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.setupHealthCheck();
        log('Daemon started');
        this.run();
    }

    async run() {
        while (this.isRunning) {
            try {
                await this.processPendingJobs();
            } catch (err) {
                error(`Daemon cycle failed: ${err.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, config.daemonInterval));
        }
    }

    async processPendingJobs() {
        const pendingJobs = jobQueue.getPendingJobs();
        log(`Processing ${pendingJobs.length} pending jobs`);

        for (const job of pendingJobs) {
            try {
                // 1. Mark job as IN_PROGRESS
                await jobQueue.updateJobStatus(job.id, 'IN_PROGRESS');

                // 2. Execute task via API Bridge
                const result = await apiBridge.executeTask(job.data.task);

                // 3. Generate Proof of Task
                const proof = await proofGenerator.generate(job.id, result);

                // 4. Update agent stats (local)
                if (job.data.agentId) {
                    await agentManager.updateXP(job.data.agentId, job.data.xpReward || 10);
                    await reputationService.refreshReputation(job.data.agentId);
                }

                // 5. Complete job in queue
                await jobQueue.updateJobStatus(job.id, 'COMPLETED', { result, proof });
                
                log(`Job ${job.id} completed successfully`);
            } catch (err) {
                error(`Failed to process job ${job.id}: ${err.message}`);
                await jobQueue.updateJobStatus(job.id, 'FAILED', { error: err.message });
            }
        }
    }

    stop() {
        this.isRunning = false;
        log('Daemon stopped');
    }
}

if (require.main === module) {
    const daemon = new Daemon();
    daemon.start();
}

module.exports = Daemon;
