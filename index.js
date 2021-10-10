const { App } = require("@slack/bolt");
const fs = require("fs");
const { Client } = require("espn-fantasy-football-api/node"); // node
const table = require("table").table;
const nodeHtmlToImage = require("node-html-to-image");
require('dotenv').config()

// Initializes your app with your bot token and signing secret
const app = new App({
  token: `${process.env.BOT_TOKEN}`,
  signingSecret: `${process.env.SIGNING_SECRET}`,
  socketMode: true,
  appToken: `${process.env.APP_TOKEN}`
});
const myClient = new Client({ leagueId: 56069 });
myClient.setCookies({
  espnS2: `${process.env.FF_S2}`,
  SWID: `${process.env.FF_SWID}`,
});

const STANDINGS_FILE_NAME = (num) => `week${num}.png`;

const BOT_ID = "<@U02H4H18945>";

const dictionary = {
  "what is your purpose?": `i'm just here so i don't get fined`,
  "who is the real commissioner?": "Dano",
};

const UNKNWOWN_PHRASES = [
    `i'm just here so i don't get fined.`,
    `use English, i have no fucking clue what you just said.`,
    `:shrug:`,
    `idk. but rememeber when Will drafted Andrew Luck 2nd overall? i do.`,
    `come again?`,
    `be sure to download HiddenVault on the iOS App Store!`,
    `y'all are giving me a headache`,
    `Ok, only thing I’m gonna say on it - You shouldn’t make offers when you aren’t sure. Because I just wasted my time looking at bye weeks, checking over opponents, ros ranks, and making an entirely different deal, just for you to watch one 30 second clip and change your mind. And I didn’t even get the condescending “sorry” I was expecting. Please respect people’s time.`,

];

const INTRODUCTION = `Hello everyone! My name is CommissionerBot, the sentient commissioner... uh, bot? I'm here to do just as much work as the actual commissioners (not much. also, why are there 2? :thinking_face: ). My job is to update the Weekly Standings and ignore any trade approval/veto requests. Sound familiar? `;

const greetingsRegex = /\b(hi|hello|welcome)\b/g


app.message(`${BOT_ID}`, async ({ message, context, say }) => {
  const { text } = message;
  const searchText = text.replace(BOT_ID, "").toLowerCase().trim();

  console.log(searchText);

  if (searchText.indexOf("nap time") >= 0) {
    await say(`It's nap time, I'll be back later. . . `);
    return app.stop();
  }

  if (searchText.indexOf('introduce yourself') >=0) {
      return await say(INTRODUCTION);
  }

  if (searchText.indexOf("standings") >= 0) {
    const currentWeek = searchText.match(/\d+/)[0];

    if (currentWeek) {
      if (fs.existsSync(STANDINGS_FILE_NAME(currentWeek))) {
        console.log("sending standings");
        await sendStandingsImg(currentWeek);
      } else {
        console.log("fetching and sending standings");
        await run(currentWeek);
        await sendStandingsImg(currentWeek);
      }
    }
    return;
  }

  if (dictionary[searchText]) {
    return await say(dictionary[searchText]);
  }
  if (searchText.match(greetingsRegex)) {
    return await say(`<@${message.user}> sup, nerd`);
  }
  return await say(getRandomResponse(UNKNWOWN_PHRASES));
});

app.command("/standings", async ({ command, ack, respond }) => {
  await ack();
  await sendStandingsImg(command.text);
});

let leagueData;
let formattedTeams;
let formattedBoxScores;

const TEAMS = [];
const WEEKLY_SCORES = [];

async function run(weeks) {
  console.log("--- LEAGUE INFO ---");
  leagueData = await getLeaugeInfo();
  console.log("--- END LEAGUE INFO ---");

  console.log("--- TEAM INFO ---");
  formattedTeams = await getTeamInfo();
  TEAMS.push(...formattedTeams);
  console.log("--- END TEAM INFO ---");

  console.log("--- Boxscores ---");
  formattedBoxScores = await getBoxscores(weeks);
  WEEKLY_SCORES.push(...formattedBoxScores);
  console.log("--- End Boxscore ---");

  console.log("--- Creating Rankings ... ---");
  createRankings();
  TEAMS.sort(rankTeams);
  console.log("--- Rankings finished! ---");

  console.log("--- RANKINGS ---");
  console.log("RANKINGS: ", TEAMS);
  console.table(TEAMS);
  console.log("--- END RANKINGS ---");

  console.log("--- Writing to file ---");
  const results = await outputResults(weeks);
  return results;
}

function rankTeams(a, b) {
  // sort by leaguePoints, tie is broken by total PF
  return a.leaguePoints === b.leaguePoints
    ? b.totalPointsScored - a.totalPointsScored
    : b.leaguePoints - a.leaguePoints;
}

async function getLeaugeInfo() {
  return myClient.getLeagueInfo({ seasonId: 2021 });
}

async function getTeamInfo() {
  const teamData = await myClient.getTeamsAtWeek({
    seasonId: 2021,
    scoringPeriodId: 1,
  });
  const updatedTeams = teamData.map((team) => {
    const { id, name, wins, losses, totalPointsScored } = team;

    return {
      id,
      name,
      wins,
      losses,
      totalPointsScored,
      leaguePointsFromWins: wins * 3,
      leaugePointsFromTop7: 0,
      leaguePoints: wins + 0,
    };
  });
  return updatedTeams;
}

async function getBoxscores(finishedWeeks) {
  const allWeeks = [];

  for (let i = 1; i <= finishedWeeks; i++) {
    const week = await getBoxscoresForWeek(i);
    allWeeks.push(week);
  }

  fs.writeFileSync("boxscoreData.json", JSON.stringify(allWeeks));

  return [...allWeeks];
}

async function getBoxscoresForWeek(weekNumber) {
  const weekTotals = [];
  const boxScores = await myClient.getBoxscoreForWeek({
    seasonId: 2021,
    matchupPeriodId: weekNumber,
    scoringPeriodId: weekNumber,
  });
  const data = boxScores.map((score) => {
    const { homeTeamId, awayTeamId } = score;
    const homeTeam = formattedTeams.find((team) => team.id === homeTeamId).name;
    const awayTeam = formattedTeams.find((team) => team.id === awayTeamId).name;

    weekTotals.push({ homeTeam, points: score.homeScore, id: homeTeamId });
    weekTotals.push({ awayTeam, points: score.awayScore, id: awayTeamId });

    return {
      homeTeamName: homeTeam,
      awayTeamName: awayTeam,
    };
  });

  const top7Scores = weekTotals.sort(getTop7Points).slice(0, 7);

  console.log("Top 7 Scorers: ", top7Scores);

  const week = {
    week: weekNumber,
    top7: top7Scores,
    scores: weekTotals,
    matchups: data,
  };

  return week;
}

function getTop7Points(a, b) {
  return b.points - a.points;
}

function createRankings() {
  WEEKLY_SCORES.forEach((week) => {
    console.log("xxx ", week);
    const { top7 } = week;

    top7.forEach((top7Team) => {
      const team = TEAMS.find((team) => team.id === top7Team.id);
      team.leaugePointsFromTop7 += 1;
    });
  });

  TEAMS.forEach((team) => {
    team.leaguePoints = team.leaguePointsFromWins + team.leaugePointsFromTop7;
  });
}

async function outputResults(currentWeekNumber) {
  const formatTableData = TEAMS.map((team, i) => {
    const row = [];
    row.push(i + 1);
    row.push(team.name);
    row.push(team.wins);
    row.push(team.losses);
    row.push(team.leaguePoints);
    row.push(Math.round(team.totalPointsScored * 100) / 100);
    return row;
  });
  formatTableData.unshift([
    "Rank",
    "Team Name",
    "Wins",
    "Losses",
    "Points",
    "PF",
  ]);
  console.log("table: ", formatTableData);

  let output = table(formatTableData);
  console.log(output);

  let html = makeTableHTML(formatTableData);

  await generateImage(html, currentWeekNumber);

  fs.writeFile("tabledata.txt", output, "utf8", function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });

  return output;
}

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();

async function generateImage(html, currentWeekNumber) {
  await nodeHtmlToImage({
    output: STANDINGS_FILE_NAME(currentWeekNumber),
    selector: "table",
    html: html,
  });
}

async function sendStandingsImg(weekNumber) {
  try {
    console.log("TRY - sendings standings");

    // Call the files.upload method using the WebClient
    await app.client.files.upload({
      // channels can be a list of one to many strings
      channels: "#commissioner-bot",
      initial_comment: `Here are the Week ${weekNumber} Standings`,
      // Include your filename in a ReadStream here
      file: fs.createReadStream(STANDINGS_FILE_NAME(weekNumber)),
    });
  } catch (error) {
    console.error(error);
  }
}

function makeTableHTML(myArray) {
  var result = "<table border=1>";
  for (var i = 0; i < myArray.length; i++) {
    result += "<tr>";
    for (var j = 0; j < myArray[i].length; j++) {
      result += "<td>" + myArray[i][j] + "</td>";
    }
    result += "</tr>";
  }
  result += "</table>";

  return result;
}

function getRandomResponse(phrases) {
    return phrases[Math.floor(Math.random()*phrases.length)];
}
