require("dotenv").config();
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

  /*
  (async () => {
  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      'Name': {
        type: 'title',
        title: [
          {
            type: 'text',
            text: {
              content: 'Tomatoes',
            },
          },
        ],
      },
      Price: {
        type: 'number',
        number: 1.49,
      },
      'Last ordered': {
        type: 'date',
        date: {
          start: '2021-05-11',
        },
      },
    },
    });
    console.log(response);
  })();
*/


}

postData(mlb);
