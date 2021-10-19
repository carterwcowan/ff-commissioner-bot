import client from "../client.js";
import fs from "fs";

export async function generateStandings(weekNumber) {
  const weeks = parseInt(weekNumber);
  const teams = await getTeams();
  const weeklyScores = await getAllBoxscores(weeks, teams);
  const rankings = createRankings(weeklyScores, teams);
  return rankings;
}

async function getTeams() {
  const teamData = await client.getTeamsAtWeek({
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

async function getAllBoxscores(finishedWeeks, teams) {
  const allWeeks = [];

  for (let i = 1; i <= finishedWeeks; i++) {
    const week = await getBoxscoresForWeek(i, teams);
    allWeeks.push(week);
  }

  return [...allWeeks];
}

async function getBoxscoresForWeek(weekNumber, teams) {
  const weekTotals = [];
  const boxScores = await client.getBoxscoreForWeek({
    seasonId: 2021,
    matchupPeriodId: weekNumber,
    scoringPeriodId: weekNumber,
  });
  const data = boxScores.map((score) => {
    const { homeTeamId, awayTeamId } = score;
    const homeTeam = teams.find((team) => team.id === homeTeamId).name;
    const awayTeam = teams.find((team) => team.id === awayTeamId).name;

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

function createRankings(weeklyScores, teams) {
  weeklyScores.forEach((week) => {
    console.log("xxx ", week);
    const { top7 } = week;

    top7.forEach((top7Team) => {
      const team = teams.find((team) => team.id === top7Team.id);
      team.leaugePointsFromTop7 += 1;
    });
  });

  teams.forEach((team) => {
    team.leaguePoints = team.leaguePointsFromWins + team.leaugePointsFromTop7;
  });

  fs.writeFile('./assets/weeklyscores.json', JSON.stringify(weeklyScores), ()=>{});
  fs.writeFile('./assets/teams.json', JSON.stringify(teams.sort(rankTeams)), ()=>{});

  return teams.sort(rankTeams);
}

function rankTeams(a, b) {
  // sort by leaguePoints, tie is broken by total PF
  return a.leaguePoints === b.leaguePoints
    ? b.totalPointsScored - a.totalPointsScored
    : b.leaguePoints - a.leaguePoints;
}

function getTop7Points(a, b) {
  return b.points - a.points;
}
