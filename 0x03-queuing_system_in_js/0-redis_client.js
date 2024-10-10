import { createClient } from 'redis';

const client = createClient();

client.on('connect', () => {
    console.log('Redis client connected');
    });

client.on('error', (err) => {
    console.log(`Something went wrong ${err}`);
});

export default client;
