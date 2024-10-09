const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: 'http://localhost:9200',
    auth: {
        username: 'your-username',
        password: 'your-password'
    }
});

module.exports = client;