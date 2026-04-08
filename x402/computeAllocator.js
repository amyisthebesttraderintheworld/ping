const db = require('../backend/db');
const { log } = require('../backend/utils');

class ComputeAllocator {
    async allocate(agentId, amount) {
        log(`Allocating ${amount} compute credits to agent ${agentId}`);
        const agents = db.get('agents');
        const agent = agents[agentId];
        if (agent) {
            agent.computeCredits = (agent.computeCredits || 0) + amount;
            db.set('agents', agents);
            log(`Credits allocated. New balance: ${agent.computeCredits}`);
        }
    }
}

module.exports = new ComputeAllocator();
