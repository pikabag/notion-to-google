const abbrev = require("./lib/abbrev.js");

const rename = (teamName, league) => {
  if (!teamName) {
    return "";
  }
  teamName = teamName.trim();
  switch (league) {
    case "nba": {
      const nn = abbrev.nba_abbrev[teamName];
      if (nn == undefined) {
        console.log("Map not found for team: " + teamName);
        return teamName;
      } else {
        return nn;
      }
    }
  }
};

module.exports = {
  rename,
};
