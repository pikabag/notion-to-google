require("dotenv").config({ path: __dirname + "/../.env" });
const { Client } = require("@notionhq/client");
const fs = require('fs');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_API_DATABASE;

const nfl = fs.readFileSync('../data/nfl-test.json');
const mlb = fs.readFileSync('../data/mlb-test.json');
const nba = fs.readFileSync('../data/nba-test.json');
const nhl = fs.readFileSync('../data/nhl-test.json');

const getDatabase = async () => {
  const response = await notion.databases.query({ database_id: databaseId });
  // console.log(response);
  listNames(response);
};

const listNames = (response) => {
  const results = response.results;
  results.forEach((child, i) => {
    console.log(child.properties);
  });
};

const postData = league => {
  league = JSON.parse(league);
  console.log(league[0]);

  (async () => {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      icon: {
        type: "emoji",
        emoji: "⚾"
      },
      properties: {
        'Name': {
          type: 'title',
          title: [
            {
              type: 'text',
              text: { content: league[0].title },
            },
          ],
        },
        'id': {
          type: 'number',
          number: league[0].id
        },
        'Date': {
          type: 'date',
          date: {
            start: league[0].dateTime,
            timeZone: 'America/New_York'
          },
        },
        'League': {
          'select': {
            name: league[0].league
          }
        },
        'Home': {
          'select': {
            name: league[0].homeAbb
          }
        },
        'Home Full': {
          'rich_text': [{
            text: { content: league[0].homeFull }
          }]
        },
        'Away': {
          'select': {
            name: league[0].awayAbb
          }
        },
        'Away Full': {
          'rich_text': [{
            text: { content: league[0].awayFull } 
          }]
        },
        'Link': {
          'url': league[0].link
        },
        'Arena': {
          'rich_text': [{
            text: { content: league[0].location }
          }]
        },
      },
    });
    console.log(response);
  })();
}

postData(nba);
