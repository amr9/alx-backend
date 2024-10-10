import { createClient, print } from 'redis';

const client = createClient();

client.on('connect', () => {
    print('Redis client connected to the server');
}
);

client.on('error', (err) => {
    print(`Redis client not connected to the server: ${err}`);
}
);

function setNewSchool(schoolName, value) {
    client.set(schoolName, value, (err, reply) => {
        print(`Reply: ${reply}`);
    });
}

function displaySchoolValue(schoolName) {
    client.get(schoolName, (err, reply) => {
        print(reply);
    });
}

displaySchoolValue('Holberton');
setNewSchool('HolbertonSanFrancisco', '100');
displaySchoolValue('HolbertonSanFrancisco');
