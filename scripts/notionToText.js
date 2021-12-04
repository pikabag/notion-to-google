const { Client } = require("@notionhq/client");
require("dotenv").config({ path: __dirname + "/../.env" });
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_API_DATABASE;
const TEST = process.env.TEST;

//Query
const fetch = async () => {
  const response = await notion.databases.query({
    database_id: databaseId,
    // sorts: [
    //   {
    //     property: "Last ordered",
    //     direction: "ascending",
    //   },
    // ],
    filter: {
      and: [
        {
          property: "League",
          select: {
            equals: "NBA",
          },
        },
        {
          property: "Name",
          text: {
            contains: "LAC",
          },
        },
      ],
    },
    page_size: 10,
  });
  return response;
};

const write = (obj) => {
  obj = JSON.stringify(obj, null, "");
  const fs = require("fs");
  const readline = require("readline");
  const path =
    TEST == 1 ? `../data/notionToText-test.json` : `../data/notionToText.json`;

  fs.writeFileSync(path, obj, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Success writing to file for Notion -> Text.`);
    }
  });
};

//Main Code
(async () => {
  var results = await fetch();
  results = results.results;
  var arr = [];

  results.forEach((child) => {
    arr.push(child.properties);
  });

  write(arr);
})();
