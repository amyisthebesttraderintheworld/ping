const db = require('./db');
const { log } = require('./utils');

class ReputationService {
    calculateReputationScore(agentId) {
        log(`Calculating reputation for agent ${agentId}`);
        const agents = db.get('agents');
        const agent = agents[agentId];
        if (!agent) return 0;

        const totalJobs = agent.successfulJobs + agent.failedJobs;
        if (totalJobs === 0) return 0;

        const baseScore = (agent.successfulJobs / totalJobs) * 100;
        const xpBonus = Math.min(agent.xp / 1000, 20); // Max 20 points bonus for XP
        return Math.min(baseScore + xpBonus, 100);
    }

    async refreshReputation(agentId) {
        const score = this.calculateReputationScore(agentId);
        log(`Refreshed score for ${agentId}: ${score}`);
        const reputations = db.get('reputation') || {};
        reputations[agentId] = {
            score: score,
            lastCalculated: Date.now()
        };
        db.set('reputation', reputations);
        return score;
    }
}

module.exports = new ReputationService();
