const db = require('../backend/db');
const { log } = require('../backend/utils');

class A2AManager {
    async delegateTask(fromAgentId, toAgentId, jobId) {
        log(`Agent ${fromAgentId} delegating task ${jobId} to agent ${toAgentId}`);
        const jobs = db.get('jobs');
        if (jobs[jobId]) {
            jobs[jobId].delegatedBy = fromAgentId;
            jobs[jobId].agentId = toAgentId;
            db.set('jobs', jobs);
            log(`Task ${jobId} delegated successfully`);
        }
    }

    async findCapableAgent(requiredSkill) {
        log(`Finding agent with skill: ${requiredSkill}`);
        const agents = db.get('agents');
        const list = Object.values(agents);
        return list.find(a => a.metadata.skillTags.includes(requiredSkill) && a.status === 'IDLE');
    }
}

module.exports = new A2AManager();
