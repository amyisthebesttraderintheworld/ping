const axios = require('axios');
const config = require('./config');
const { log, error } = require('./utils');

class APIBridge {
    constructor() {
        this.openaiKey = config.apiKeys.openai;
    }

    async executeTask(taskDescription) {
        log(`Executing task: ${taskDescription}`);
        
        // Mock OpenAI interaction if no key is provided
        if (!this.openaiKey || this.openaiKey === 'YOUR_OPENAI_API_KEY') {
            return this.mockTaskExecution(taskDescription);
        }

        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: taskDescription }]
            }, {
                headers: { 'Authorization': `Bearer ${this.openaiKey}` }
            });
            return response.data.choices[0].message.content;
        } catch (err) {
            error(`API call failed: ${err.message}`);
            throw err;
        }
    }

    async mockTaskExecution(taskDescription) {
        log('Using mock API response...');
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`Processed task: "${taskDescription}" with success. Result hash: ${Math.random().toString(36).substring(7)}`);
            }, 1000);
        });
    }
}

module.exports = new APIBridge();
