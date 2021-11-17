require("dotenv").config({ path: __dirname + "/../.env" });
const { Client } = require("@notionhq/client");
const fs = require("fs");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_API_DATABASE;

const TEST = process.env.TEST;

const mlbDummy = fs.readFileSync("../data/mlb-dummy-data.json");
const verifyIds = (data) => {
  let len = data.length;
  let arr = [];

  for (let i = 0; i < len; i++) {
    let id = data[i].id.split("-")[1];
    console.log(`id: ${id} @index: ${i}`);
    id = parseInt(id);
    if (id != i + arr.length) {
      arr.push(id - 1);
      i--;
    }
  }

  console.log(`Missing IDs: `);
  console.log(arr);
};

const data = JSON.parse(mlbDummy);
// console.log(data);
verifyIds(data);

//Still rather inefficient eh?
//Correct output: [ 3, 5, 8, 59, 67, 77, 79, 83, 84 ]
