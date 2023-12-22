onst express = require('express');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const app = express();
const port = process.env.PORT || 8080;

async function getSecret() {
  const client = new SecretManagerServiceClient();
  const projectId = process.env.GCP_PROJECT_ID; 
  const secretName = process.env.SECRET_NAME;

  try {
    const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
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
