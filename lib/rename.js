const abbrev = require("./abbrev.js");

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
    case "nfl": {
      const nn = abbrev.nfl_abbrev[teamName];
      if (nn == undefined) {
        console.log("Map not found for team: " + teamName);
        return teamName;
      } else {
        return nn;
      }
    }
    case "mlb": {
      const nn = abbrev.mlb_abbrev[teamName];
      if (nn == undefined) {
        console.log("Map not found for team: " + teamName);
        return teamName;
      } else {
        return nn;
      }
    }
    case "nhl": {
      const nn = abbrev.nhl_abbrev[teamName];
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
