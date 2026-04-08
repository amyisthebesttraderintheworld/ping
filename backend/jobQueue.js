const db = require('./db');
const { log } = require('./utils');

class JobQueue {
    constructor() {
        this.queue = db.get('jobs') || {};
    }

    async addJob(jobId, data) {
        log(`Adding job ${jobId} to queue`);
        const jobs = db.get('jobs');
        jobs[jobId] = {
            id: jobId,
            data: data,
            status: 'PENDING',
            result: null,
            proof: null,
            createdAt: Date.now()
        };
        db.set('jobs', jobs);
    }

    async updateJobStatus(jobId, status, extra = {}) {
        log(`Updating job ${jobId} to ${status}`);
        const jobs = db.get('jobs');
        if (jobs[jobId]) {
            jobs[jobId] = { ...jobs[jobId], status, ...extra };
            db.set('jobs', jobs);
        }
    }

    getPendingJobs() {
        const jobs = db.get('jobs');
        return Object.values(jobs).filter(j => j.status === 'PENDING');
    }
}

module.exports = new JobQueue();
