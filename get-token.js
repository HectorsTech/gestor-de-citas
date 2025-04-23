const { google } = require('googleapis');
const readline = require('readline');
const credentials = require('./credentials.json');

const oAuth2Client = new google.auth.OAuth2(
  credentials.installed.client_id,
  credentials.installed.client_secret,
  credentials.installed.redirect_uris[0]
);

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('Autoriza esta URL:', authUrl);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Pega aquí el código de autorización: ', async code => {
  const { tokens } = await oAuth2Client.getToken(code);
  console.log('REFRESH TOKEN:', tokens.refresh_token);
  rl.close();
});
