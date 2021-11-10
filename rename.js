const abbrev = require("./lib/abbrev.js");

const rename = (teamName, league) => {
  teamName = teamName.trim();
  switch (league) {
    case "nba": {
      return abbrev.nba_abbrev[teamName];
    }
  }
};

module.exports = {
  rename,
};
