const fs = require("fs");
const readline = require("readline");
const abbrev = require("../lib/abbrev.js");
const { google } = require("googleapis");
const { rename } = require("../lib/rename.js");
const { start } = require("repl");

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = "../credentials/token.json";
const CREDENTIALS_PATH = "../credentials/credentials.json";

// Load client secrets from a local file.
fs.readFile(CREDENTIALS_PATH, (err, content) => {
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
  const maxResults = 2000; //Number of entries

  const map = new Map(
    Object.entries(
      (leagues = {
        nba: "8hioqpf6n4ctjpsvb6srg897io@group.calendar.google.com",
        nfl: "umn39ikucfl4vgpn5d24e6mk4o@group.calendar.google.com",
        mlb: "ic18al4e0emq056k90ee0knkdk@group.calendar.google.com",
        nhl: "3hpbubhguubuelviktjc34qfs8@group.calendar.google.com",
      })
    )
  ).forEach((value, index) => {
    list(value, index);
  });

  function list(calendarId, league) {
    calendar.events.list(
      {
        calendarId: calendarId, //NBA
        timeMin: new Date().toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: "startTime",
      },
      (err, res) => {
        if (err) return console.log("The API returned an error: " + err);
        // console.log(`Showing data for the next ${maxResults} items:`);
        const events = res.data.items;
        var arr = []; //Array for fs.writeFile()
        if (events.length) {
          events.map((event, i) => {
            const start = event.start.dateTime || event.start.date;
            // const str = `${i + 1}: ${start} - ${away} @ ${home}`;
            const obj = getObjectFromEvent(event, league, i);
            arr.push(obj);
          });
        } else {
          console.log("No upcoming events found.");
        }
        // console.log("Resultant array: ");
        // console.log(arr);
        writeToFile(arr, league, "json");
      }
    );
  }
}

const writeToFile = (arr, league, ext) => {
  arr = JSON.stringify(arr, null, " ");
  fs.writeFile(`../data/test_gameList-${league}.${ext}`, arr, (err) => { //TEST
    if (err) console.log(err);
    else console.log(`Success writing to file for league: ${league}`);
  });
};

const getObjectFromEvent = (event, league, index) => {
  let [awayFull, homeFull] = event.summary.split(" @ ");
  let dateTime, link, location;

  if (awayFull === "TBD" || homeFull === "TBD") {
    awayAbb = awayFull = homeFull = homeAbb = "TBD";
  } else {
    awayFull = awayFull.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    ).trim();
    homeFull = homeFull.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    ).trim();
    awayAbb = rename(awayFull, league);
    homeAbb = rename(homeFull, league);
    dateTime = new Date(event.start.dateTime).toLocaleString();
    [location] = event.location.split(" - ");
    link = event.description.match(/\bhttps?:\/\/\S+/gi)[0];
  }

  let obj = {
    id: index,
    awayAbb: awayAbb,
    awayFull: awayFull,
    homeAbb: homeAbb,
    homeFull: homeFull,
    dateTime: dateTime,
    league: league.toUpperCase(),
    link: link,
    location: location,
  };
  // console.log(obj);
  return obj;
};
