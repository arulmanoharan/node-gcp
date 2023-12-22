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

app.get('/', async (req, res) => {
  const secretValue = await getSecret();
  const secretObject = JSON.parse(secretValue);
  // Send an HTML page with the secret value
  const htmlPage = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Secret Display Page</title>
      </head>
      <body>
        <h1>Secret Value:</h1>
        <p>${secretObject.connection_name}</p>
        <p>${secretObject.username}</p>
        <p>${secretObject.password}</p>
        <p>${secretObject.database}</p>
      </body>
    </html>
  `;

  res.send(htmlPage);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
