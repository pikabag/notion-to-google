require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_API_DATABASE;

const getDatabase = async () => {
  const response = await notion.databases.query({ database_id: databaseId });
  console.log(response);
};

getDatabase();

