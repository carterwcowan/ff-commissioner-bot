const { Client } = require("espn-fantasy-football-api/node"); // node
const fs = require("fs");
const table = require("table").table;

const myClient = new Client({ leagueId: 56069 });

myClient.setCookies({
  espnS2:
    "AEBQVltFjpaLZb%2Fuivql7AmgF4w2vWV0%2F8YrztZaoBOjJVBG4e3sLw7Oe7zcq1XY3RCEYdOHcQpl1PlUzHmUb9mkdNRHFnrvIrzXYoXtiWWybGfGzSux0Ki0uaoocvhJ%2FXe%2B%2Bk7NbnA2hi6DoymumyJ1O7%2B%2FSU3k03Zdwc%2F60Ckq9ZhFdFXJ6CBzvXdhmOGg6dk3%2BJCk9FTS0PZOuKuhXhykqlSxdr5Ps4rHzwCDQpEbeTITxgxAxKDYGNktXqmiAiNF1ynSUEYl%2BmtlOtM5rpQL",
  SWID: "{B13BCF49-D780-46A1-ADD1-0D383C42243A}",
});

let weeks = process.env.npm_config_weeks || 1;
const FINISHED_WEEKS = parseInt(weeks);

let leagueData;
let formattedTeams;
let formattedBoxScores;

const TEAMS = [];
const WEEKLY_SCORES = [];


async function run() {
  console.log("--- LEAGUE INFO ---");
  leagueData = await getLeaugeInfo();
  console.log("--- END LEAGUE INFO ---");

  console.log("--- TEAM INFO ---");
  formattedTeams = await getTeamInfo();
  TEAMS.push(...formattedTeams);
  console.log("--- END TEAM INFO ---");

  console.log("--- Boxscores ---");
  formattedBoxScores = await getBoxscores();
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
  outputResults();
}

run();

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

async function getBoxscores() {
  const allWeeks = [];

  for (let i = 1; i <= FINISHED_WEEKS; i++) {
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

function outputResults() {
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

  let html = makeTableHTML(formatTableData);
  fs.writeFile("tabledata.html", html, "utf8", function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The html file was saved!");
  });

  let output = table(formatTableData);
  console.log(output);

  fs.writeFile("tabledata.txt", output, "utf8", function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
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
