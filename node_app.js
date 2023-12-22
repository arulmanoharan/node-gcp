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
  const secretValue = await getSecret();
  const secretObject = JSON.parse(secretValue);
  const connection = await createConnectionPool(secretObject);
  // Send an HTML page with the secret value
  connection.query(
    `CREATE TABLE IF NOT EXISTS uname (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      password VARCHAR(255)
    )`,
    (error) => {
      if (error) throw error;
      console.log('Table created or already exists');
    }
  );
  const [rows] = connection.query('SELECT * from uname');
  let html = '<h1>Table Details</h1>';
    html += '<table border="1"><tr><th>ID</th><th>Username</th><th>Password</th></tr>';
    
    tableData.forEach(row => {
      html += `<tr><td>${row.id}</td><td>${row.username}</td><td>${row.password}</td></tr>`;
    });

    html += '</table>';
    res.send(html);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
