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

const get = promisify(client.get).bind(client);

async function displaySchoolValue(schoolName) {
  const result = await get(schoolName).catch((error) => {
    if (error) {
      console.log(error);
      throw error;
    }
  });
  console.log(result);
}

displaySchoolValue('Holberton');
setNewSchool('HolbertonSanFrancisco', '100');
displaySchoolValue('HolbertonSanFrancisco');
