require("dotenv").config({ path: __dirname + "/../.env" });
const { Client } = require("@notionhq/client");
const fs = require("fs");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_API_DATABASE;

const baseball_emoji = "⚾";
const basketball_emoji = "🏀";
const football_emoji = "🏈";
const hockey_emoji = "🏒";

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

  results.forEach((item) => {
    console.log(item.id);
    const response = notion.pages.update({
      page_id: item.id,
      archived: true,
    });
  });

  // listNames(response);
};

const postData = (league) => {
  league = JSON.parse(league);

  league.forEach(async (data, i) => {
    console.log(`POSTing for ${data.id}`);
    console.log(data);
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      icon: {
        type: "emoji",
        emoji: basketball_emoji,
      },
      properties: {
        Name: {
          type: "title",
          title: [
            {
              type: "text",
              text: { content: data.title },
            },
          ],
        },
        id: {
          rich_text: [
            {
              text: { content: data.id },
            },
          ],
        },
        Date: {
          type: "date",
          date: {
            start: data.dateTime,
          },
        },
        League: {
          select: {
            name: data.league,
          },
        },
        Home: {
          select: {
            name: data.homeAbb,
          },
        },
        "Home Full": {
          rich_text: [
            {
              text: { content: data.homeFull },
            },
          ],
        },
        Away: {
          select: {
            name: data.awayAbb,
          },
        },
        "Away Full": {
          rich_text: [
            {
              text: { content: data.awayFull },
            },
          ],
        },
        Link: {
          url: data.link,
        },
        Arena: {
          rich_text: [
            {
              text: { content: data.location },
            },
          ],
        },
      },
    });
    console.log(response);
  });

  // for (let i = 0; i < 2000; i++) {
  //   data = league[i];
  //   if (!data) break;

  //   async () => {
  //     console.log(`POSTing for ${data.id}`);
  //     const response = await notion.pages.create({
  //       parent: { database_id: databaseId },
  //       icon: {
  //         type: "emoji",
  //         emoji: basketball_emoji,
  //       },
  //       properties: {
  //         Name: {
  //           type: "title",
  //           title: [
  //             {
  //               type: "text",
  //               text: { content: data.title },
  //             },
  //           ],
  //         },
  //         id: {
  //           type: "rich_text",
  //           number: data.id,
  //         },
  //         Date: {
  //           type: "date",
  //           date: {
  //             start: data.dateTime,
  //           },
  //         },
  //         League: {
  //           select: {
  //             name: data.league,
  //           },
  //         },
  //         Home: {
  //           select: {
  //             name: data.homeAbb,
  //           },
  //         },
  //         "Home Full": {
  //           rich_text: [
  //             {
  //               text: { content: data.homeFull },
  //             },
  //           ],
  //         },
  //         Away: {
  //           select: {
  //             name: data.awayAbb,
  //           },
  //         },
  //         "Away Full": {
  //           rich_text: [
  //             {
  //               text: { content: data.awayFull },
  //             },
  //           ],
  //         },
  //         Link: {
  //           url: data.link,
  //         },
  //         Arena: {
  //           rich_text: [
  //             {
  //               text: { content: data.location },
  //             },
  //           ],
  //         },
  //       },
  //     });
  //     console.log(response);
  //   };
  // }
};

// deleteItems();
postData(nba);
