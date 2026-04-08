const db = require('../backend/db');
const { log } = require('../backend/utils');
const config = require('../backend/config');

class AutoUpgrade {
    async checkUpgrades(agentId) {
        log(`Checking upgrades for agent ${agentId}`);
        const agents = db.get('agents');
        const agent = agents[agentId];
        if (!agent) return;

        // Upgrade logic based on XP
        if (agent.xp >= 100 && !agent.metadata.skillTags.includes('ADVANCED')) {
            await this.applyUpgrade(agentId, 'ADVANCED_REASONING');
        }
    }

    async applyUpgrade(agentId, upgradeType) {
        log(`Applying upgrade ${upgradeType} to agent ${agentId}`);
        const agents = db.get('agents');
        const agent = agents[agentId];
        
        agent.metadata.skillTags += `, ${upgradeType}`;
        agent.xp -= 50; // Cost of upgrade
        
        db.set('agents', agents);
        log(`Upgrade ${upgradeType} applied successfully`);
    }
}

module.exports = new AutoUpgrade();
