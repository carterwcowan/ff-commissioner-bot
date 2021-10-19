import pkg from 'espn-fantasy-football-api/node.js';
const { Client } = pkg;

// require("dotenv").config();

const client = new Client({ leagueId: process.env.FF_LEAGUE_ID });
client.setCookies({
  espnS2: `${process.env.FF_S2}`,
  SWID: `${process.env.FF_SWID}`,
});

export default client;
