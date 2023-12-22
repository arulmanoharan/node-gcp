const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


async function getSecret() {
  const client = new SecretManagerServiceClient();
  const projectId = process.env.GCP_PROJECT_ID; 
  const secretName = process.env.SECRET_NAME; 

  
try{
  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
  });
      return version.payload.data.toString('utf8');
  } catch (err) {
    console.error('Error fetching secret:', err);
    return null;
  }
}

async function createConnection() {
  const secretValue = await getSecret();

  if (!secretValue) {
    console.error('Secret value is null or undefined. Unable to establish database connection.');
    return null;
  }

  try {
    const config = JSON.parse(secretValue);

    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
    });

    return connection;
  } catch (error) {
    console.error('Error creating database connection:', error);
    return null;
  }
}

app.get('/', async (req, res) => {
  const connection = await createConnection();

  if (connection) {
    try {
      // Fetch the list of names from the 'uname' table
      const [rows] = await connection.execute('SELECT * FROM uname');

      // Render the HTML page with the list of names and a form to add new names
      const htmlPage = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Name List</title>
          </head>
          <body>
            <h1>Name List:</h1>
            <table border="1">
              <tr>
                <th>ID</th>
                <th>Name</th>
              </tr>
              ${rows.map(row => `
                <tr>
                  <td>${row.id}</td>
                  <td>${row.name}</td>
                </tr>`).join('')}
            </table>
            <h2>Add New Name:</h2>
            <form action="/addname" method="post">
              <label for="newName">Name:</label>
              <input type="text" id="newName" name="newName" required>
              <button type="submit">Add Name</button>
            </form>
            <h2>Print Names:</h2>
            <form action="/printnames" method="get">
              <button type="submit">Print Names</button>
            </form>
          </body>
        </html>
      `;

      res.send(htmlPage);
    } catch (error) {
      console.error('Error fetching name list:', error);
      res.status(500).send('Internal Server Error');
    } finally {
      // Close the database connection after use
      connection.end();
    }
  } else {
    // Connection failed, send an error response
    res.status(500).send('Internal Server Error');
  }
});

app.post('/addname', async (req, res) => {
  const connection = await createConnection();

  if (connection) {
    try {
      const { newName } = req.body;

      if (!newName) {
        res.status(400).send('Name is required.');
        return;
      }

      // Insert the new name into the 'uname' table
      await connection.execute('INSERT INTO uname (name) VALUES (?)', [newName]);

      // Redirect back to the root route to display the updated name list
      res.redirect('/');
    } catch (error) {
      console.error('Error adding new name:', error);
      res.status(500).send('Internal Server Error');
    } finally {
      // Close the database connection after use
      connection.end();
    }
  } else {
    // Connection failed, send an error response
    res.status(500).send('Internal Server Error');
  }
});

app.get('/printnames', async (req, res) => {
  const connection = await createConnection();

  if (connection) {
    try {
      // Fetch the list of names from the 'uname' table
      const [rows] = await connection.execute('SELECT * FROM uname');

      // Render the HTML page with the list of names
      const htmlPage = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Names</title>
          </head>
          <body>
            <h1>Names:</h1>
            <ul>
              ${rows.map(row => `<li>${row.name}</li>`).join('')}
            </ul>
          </body>
        </html>
      `;

      res.send(htmlPage);
    } catch (error) {
      console.error('Error fetching name list:', error);
      res.status(500).send('Internal Server Error');
    } finally {
      // Close the database connection after use
      connection.end();
    }
  } else {
    // Connection failed, send an error response
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
