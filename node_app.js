const express = require('express');
const mysql = require('mysql');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const app = express();
const port = process.env.PORT || 3001;

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
    const insertDataQuery = 'INSERT INTO secrets (username, password) VALUES (?, ?)';
    const insertDataValues = [secretCredentials.username, secretCredentials.password];
    connectionPool.query(
      `CREATE TABLE IF NOT EXISTS secrets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        password VARCHAR(255)
      )`,
      (error) => {
        if (error) throw error;
        console.log('Table created or already exists');
      }
    );

    connectionPool.query('INSERT INTO secrets (name, password) VALUES (?, ?)', insertDataValues);

    connectionPool.query('SELECT * FROM secrets', (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
    
      res.send(results);
    });

  
    
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('<h1>Connection Failed</h1>');
   }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
