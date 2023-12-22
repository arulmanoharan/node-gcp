const express = require('express');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const app = express();
const port = process.env.PORT || 3000;

async function getSecret() {
  const client = new SecretManagerServiceClient();

  try {
    const [version] = await client.accessSecretVersion({
    name: `projects/absolute-range-408808/secrets/cloudsql-secrets/versions/latest`,
  });

    return version.payload.data.toString('utf8');
  } catch (err) {
    console.error('Error fetching secret:', err);
    return 'Error fetching secret';
  }
}

async function createConnectionPool(credentials) {
  return mysql.createPool({
    user: credentials.username,
    password: credentials.password,
    database: credentials.database_name,
    host: credentials.connection_name,
  });
}

app.get('/', async (req, res) => {
  try {
    const secretData = await getSecret();
    const secretCredentials = JSON.parse(secretData);

    const connectionPool = await createConnectionPool(secretCredentials);
    await createTable(connectionPool);

    // Check if the connection is established
    await checkConnection(connectionPool);

    // If the checkConnection() does not throw an error, the connection is established
    res.send('<h1>Connection Established</h1>');
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('<h1>Connection Failed</h1>');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
