const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const mysql = require('mysql2');
const express = require('express');

const app = express();
const port = 3000;

const projectId = 'absolute-range-408808';
const secretName = 'cloudsql-secrets';

async function retrieveSecret() {
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
  });

  return version.payload.data.toString();
}

async function createConnectionPool(credentials) {
  return mysql.createPool({
    user: credentials.username,
    password: credentials.password,
    database: credentials.database_name,
    host: credentials.connection_name,
  });
}

async function createTable(connectionPool) {
  const connection = await connectionPool.promise().getConnection();

  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS credentials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `;

    await connection.query(createTableQuery);
    console.log('Table created successfully.');
  } finally {
    connection.release();
  }
}

async function fetchTableData(connectionPool) {
  const connection = await connectionPool.promise().getConnection();

  try {
    const query = 'SELECT * FROM credentials';
    const [rows] = await connection.query(query);
    return rows;
  } finally {
    connection.release();
  }
}

app.get('/', async (req, res) => {
  try {
    const secretData = await retrieveSecret();
    const secretCredentials = JSON.parse(secretData);

    const connectionPool = await createConnectionPool(secretCredentials);
    await createTable(connectionPool);

    const tableData = await fetchTableData(connectionPool);

    let html = '<h1>Table Details</h1>';
    html += '<table border="1"><tr><th>ID</th><th>Username</th><th>Password</th></tr>';
    
    tableData.forEach(row => {
      html += `<tr><td>${row.id}</td><td>${row.username}</td><td>${row.password}</td></tr>`;
    });

    html += '</table>';
    res.send(html);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
