const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'));
}

if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ agents: {}, jobs: {}, reputation: {} }, null, 2));
}

const read = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const write = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

module.exports = {
    get: (key) => {
        const data = read();
        return data[key];
    },
    set: (key, value) => {
        const data = read();
        data[key] = value;
        write(data);
    },
    update: (key, id, updateObj) => {
        const data = read();
        data[key][id] = { ...data[key][id], ...updateObj };
        write(data);
    }
};
