import { Client as FantasyClient } from "espn-fantasy-football-api/node"; // node

require("dotenv").config();

const client = new FantasyClient({ leagueId: process.env.FF_LEAGUE_ID });
client.setCookies({
  espnS2: `${process.env.FF_S2}`,
  SWID: `${process.env.FF_SWID}`,
});

export default client;