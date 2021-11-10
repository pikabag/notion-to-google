const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const abbrev = require("./lib/abbrev.js");
const { rename } = require("./rename.js");

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = "credentials/token.json";

// Load client secrets from a local file.
fs.readFile("credentials/credentials.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  authorize(JSON.parse(content), listEvents);
});

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  fs.readFile(TOKEN_PATH, (err, token) => {
    // getAccessToken(oAuth2Client, callback);
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:\n", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function listEvents(auth) {
  const calendar = google.calendar({ version: "v3", auth });
  const maxResults = 10;
  calendar.events.list(
    {
      // calendarId: 'primary',
      calendarId: "8hioqpf6n4ctjpsvb6srg897io@group.calendar.google.com",
      timeMin: new Date().toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: "startTime",
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      console.log(`Showing data for the next ${maxResults} items:`);
      const events = res.data.items;
      var arr = []; //Array for fs.writeFile()
      if (events.length) {
        events.map((event, i) => {
          const start = event.start.dateTime || event.start.date; //date format!
          let [away, home] = event.summary.split("@");
          home = rename(home, 'nba');
          away = rename(away, 'nba');
          const str = `${i + 1}: ${start} - ${away} @ ${home}`;
          console.log(str);
          // arr.push(str);
        });
        // writeToFile(arr);
      } else {
        console.log("No upcoming events found.");
      }
    }
  );
}

const writeToFile = (arr) => {
  var file = fs.createWriteStream("gamelist.txt");
  arr = JSON.stringify(arr, null, " ");
  fs.writeFile("gamelist.txt", arr, (err) => {
    if (err) console.log(err);
    else console.log("Successfully written to file!");
  });
};
