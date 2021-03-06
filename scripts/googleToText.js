require("dotenv").config({ path: __dirname + "/../.env" });
const fs = require("fs");
const readline = require("readline");
const abbrev = require("../lib/abbrev.js");
const { google } = require("googleapis");
const { rename } = require("../lib/rename.js");
const { start } = require("repl");

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = "../credentials/token.json";
const CREDENTIALS_PATH = "../credentials/credentials.json";
const TEST = process.env.TEST;

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
  const maxResults = TEST == 1 ? 10 : 2500;

  const map = new Map(
    Object.entries(
      (leagues = {
        nba: process.env.NBA_ID,
        nfl: process.env.NFL_ID,
        mlb: process.env.MLB_ID,
        nhl: process.env.NHL_ID,
      })
    )
  ).forEach((value, index) => {
    list(value, index);
  });

  function list(calendarId, league) {
    calendar.events.list(
      {
        calendarId: calendarId,
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
            if (!obj) {
              ("No matches found for this entry.");
            } else {
              arr.push(obj);
            }
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

//WRITE FILE
const writeToFile = (arr, league, ext) => {
  arr = JSON.stringify(arr, null, " ");
  const fileWrite =
    TEST == 1 ? `../data/${league}-test.${ext}` : `../data/${league}.${ext}`;

  fs.writeFile(fileWrite, arr, (err) => {
    if (err) console.log(err);
    else console.log(`Success writing to file for league: ${fileWrite}`);
  });
};

function toEST(date) {
  var tzo = -date.getTimezoneOffset(),
    dif = tzo >= 0 ? "+" : "-",
    pad = function (num) {
      var norm = Math.floor(Math.abs(num));
      return (norm < 10 ? "0" : "") + norm;
    };

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours() + 1) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds()) +
    dif +
    pad(tzo / 60) +
    ":" +
    pad(tzo % 60)
  );
}

//OBJECT GENERATION
const getObjectFromEvent = (event, league, index) => {
  let [awayFull, homeFull] = event.summary.split(" @ ");
  let dateTime, link, location, title;

  if (awayFull === "TBD" || homeFull === "TBD") {
    //If null/undefined, declare TBD,
    return null;
  } else {
    //Remove emojis if exists
    awayFull = awayFull
      .replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        ""
      )
      .trim();
    homeFull = homeFull
      .replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        ""
      )
      .trim();
    //Adjustments
    index = `${league}-${index.toString().padStart(4, "0")}`;
    awayAbb = rename(awayFull, league);
    homeAbb = rename(homeFull, league);
    title = `${awayAbb} @ ${homeAbb}`;
    dateTime = toEST(new Date(event.start.dateTime));
    [location] = event.location.split(" - ");
    link = event.description.match(/\bhttps?:\/\/\S+/gi)[0]; //Get the first link from description string
  }

  let obj = {
    id: index,
    title: title,
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
