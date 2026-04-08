const db = require('./db');
const { log } = require('./utils');

class AgentManager {
    constructor() {
        this.agents = db.get('agents');
    }

    async registerAgent(agentId, owner, metadata) {
        log(`Registering agent ${agentId} for ${owner}`);
        const agents = db.get('agents');
        agents[agentId] = {
            id: agentId,
            owner: owner,
            metadata: metadata,
            xp: 0,
            successfulJobs: 0,
            failedJobs: 0,
            status: 'IDLE'
        };
        db.set('agents', agents);
    }

    async updateXP(agentId, xpGain) {
        log(`Updating XP for agent ${agentId} by ${xpGain}`);
        const agents = db.get('agents');
        if (agents[agentId]) {
            agents[agentId].xp += xpGain;
            agents[agentId].successfulJobs += 1;
            db.set('agents', agents);
        }
    }

    async setStatus(agentId, status) {
        const agents = db.get('agents');
        if (agents[agentId]) {
            agents[agentId].status = status;
            db.set('agents', agents);
        }
    }

    getAgent(agentId) {
        const agents = db.get('agents');
        return agents[agentId];
    }
}

module.exports = new AgentManager();
