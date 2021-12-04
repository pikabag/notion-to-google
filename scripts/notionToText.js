const { Client } = require("@notionhq/client");
require("dotenv").config({ path: __dirname + "/../.env" });
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_API_DATABASE;
const TEST = process.env.TEST;

//Query
const fetch = async () => {
  const response = await notion.databases.query({
    database_id: databaseId,
    // filter: {
    //   or: [
    //     {
    //       property: "In stock",
    //       checkbox: {
    //         equals: true,
    //       },
    //     },
    //     {
    //       property: "Cost of next trip",
    //       number: {
    //         greater_than_or_equal_to: 2,
    //       },
    //     },
    //   ],
    // },
    // sorts: [
    //   {
    //     property: "Last ordered",
    //     direction: "ascending",
    //   },
    // ],
    filter: {
      property: "League",
      select: {
        equals: "NBA",
      },
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
  var newArr = [];

  results.forEach((child) => {
    // console.log(child.properties);
    newArr.push(child.properties);
  });

  // console.log(newArr);
  write(newArr);
})();
