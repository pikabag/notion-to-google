require("dotenv").config({ path: __dirname + "/../.env" });
const { Client } = require("@notionhq/client");
const fs = require("fs");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_API_DATABASE;

const TEST = process.env.TEST;

const nflTest = fs.readFileSync("../data/nfl-test.json");
const mlbTest = fs.readFileSync("../data/mlb-test.json");
const nbaTest = fs.readFileSync("../data/nba-test.json");
const nhlTest = fs.readFileSync("../data/nhl-test.json");

const nfl = fs.readFileSync("../data/nfl.json");
const mlb = fs.readFileSync("../data/mlb.json");
const nba = fs.readFileSync("../data/nba.json");
const nhl = fs.readFileSync("../data/nhl.json");

const deleteItems = async () => {
  // For now it can only archive up to 100 rows
  const response = await notion.databases.query({
    database_id: databaseId,
  });
  let results = response.results;

  console.log(results);
};

const arg1 = process.argv[2];

const getDatabase = async () => {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "League",
      select: {
        equals: "MLB",
      },
    },
    sorts: [
      {
        property: "id",
        direction: "ascending",
      },
    ],
  });
  const results = response.results;
  return results;
  //   console.log(results[0].properties.id.rich_text[0].text.content);
};

const verifyIds = async (data) => {
  let missingIds = [];
  data = await data;
  data.forEach((element, index) => {
    var id = element.properties.id.rich_text[0].text.content;
    [, id] = id.split("-");
    id = parseInt(id);
    console.log(`Index: ${index}`);
    console.log(id);

    if (id != index + missingIds.length) {
      console.log(`Diff ${index - missingIds.length} for ${index} and ${missingIds.length}`);
      missingIds.push(id);
    }
  });

  console.log(`Missing IDs: `);
  console.log(missingIds);
};

const data = getDatabase();
verifyIds(data);
