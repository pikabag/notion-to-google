require("dotenv").config({ path: __dirname + "/../.env" });
const { Client } = require("@notionhq/client");
const fs = require('fs');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_API_DATABASE;

const nfl = fs.readFileSync('../data/gameList-nfl.json');
const mlb = fs.readFileSync('../data/gameList-mlb.json');
const nba = fs.readFileSync('../data/gameList-nba.json');
const nhl = fs.readFileSync('../data/gameList-nhl.json');

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
      properties: {
        'Name': {
          type: 'title',
          title: [
            {
              type: 'text',
              text: { content: 'test123' },
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
            start: league[0].dateTime
          },
        },
        'League': {
          type: 'select',
          name: league[0].league
        },
        'Home': {
          type: 'select',
          name: league[0].homeAbb
        },
        'Home Full': {
          type: 'text',
          name: league[0].homeFull
        },
        'Away': {
          type: 'select',
          name: league[0].awayAbb
        },
        'Away Full': {
          type: 'text',
          name: league[0].awayFull
        },
        'Link': {
          type: 'url',
          name: league[0].link
        },
        'Arena': {
          type: 'text',
          name: league[0].location
        },
      },
    });
    console.log(response);
  })();
}

postData(mlb);
