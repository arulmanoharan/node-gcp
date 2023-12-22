const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


async function accessSecret() {
  const projectId = process.env.GCP_PROJECT_ID; 
  const secretName = process.env.SECRET_NAME; 

  const client = new SecretManagerServiceClient();
try{
  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
  });
  return version.payload.data.toString('utf8');
  } catch (err) {
    console.error('Error fetching secret:', err);
    return 'Error fetching secret';
  }
}
  const secretValue = await accessSecret();
  const secretObject = JSON.parse(secretValue);

  const connection = mysql.createConnection({
    host: secretObject.connection_name,
    user: secretObject.username,
    password: secretObject.password,
    database: secretObject.database_name,
  });

// Create a table if it doesn't exist
connection.query(
  `CREATE TABLE IF NOT EXISTS uname (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
  )`,
  (error) => {
    if (error) throw error;
    console.log('Table created or already exists');
  }
);

app.get('/', async(req, res) => {
const secretValue = await accessSecret();
  const secretObject = JSON.parse(secretValue);

  const connection = mysql.createConnection({
    host: secretObject.connection_name,
    user: secretObject.username,
    password: secretObject.password,
    database: secretObject.database_name,
  });

// Create a table if it doesn't exist
connection.query(
  `CREATE TABLE IF NOT EXISTS uname (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
  )`,
  (error) => {
    if (error) throw error;
    console.log('Table created or already exists');
  }
);
  res.send(`
    <html>
      <body>
        <form action="/api/add" method="post">
          <label for="name">Enter your name:</label>
          <input type="text" id="name" name="name">
          <button type="submit">Submit Name</button>
        </form>

        <button onclick="fetchData()">Fetch Data</button>
        <div id="data-container"></div>

        <script>
          async function fetchData() {
            try {
              const response = await fetch('/api/data');
              const data = await response.json();

              // Display the data in the 'data-container' div
              const dataContainer = document.getElementById('data-container');
              dataContainer.innerHTML = '<h2>Data from Cloud SQL Database:</h2>';

              if (data.length === 0) {
                dataContainer.innerHTML += '<p>No data available.</p>';
              } else {
                dataContainer.innerHTML += '<ul>';
                data.forEach(item => {
                  dataContainer.innerHTML += '<li>' + item.name + '</li>';
                });
                dataContainer.innerHTML += '</ul>';
              }
            } catch (error) {
              console.error('Error fetching data:', error);
            }
          }
        </script>
      </body>
    </html>
  `);
});

app.post('/api/add', async(req, res) => {
 const secretValue = await accessSecret();
  const secretObject = JSON.parse(secretValue);

  const connection = mysql.createConnection({
    host: secretObject.connection_name,
    user: secretObject.username,
    password: secretObject.password,
    database: secretObject.database_name,
  });

// Create a table if it doesn't exist
connection.query(
  `CREATE TABLE IF NOT EXISTS uname (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
  )`,
  (error) => {
    if (error) throw error;
    console.log('Table created or already exists');
  }
);
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  // Insert the name into the database
  connection.query('INSERT INTO uname (name) VALUES (?)', [name], (error) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.redirect('/');
  });
});

app.get('/api/data', async(req, res) => {
 const secretValue = await accessSecret();
  const secretObject = JSON.parse(secretValue);

  const connection = mysql.createConnection({
    host: secretObject.connection_name,
    user: secretObject.username,
    password: secretObject.password,
    database: secretObject.database_name,
  });

// Create a table if it doesn't exist
connection.query(
  `CREATE TABLE IF NOT EXISTS uname (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
  )`,
  (error) => {
    if (error) throw error;
    console.log('Table created or already exists');
  }
);
  // Fetch data from the database
  connection.query('SELECT name FROM uname', (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send the data as JSON
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
