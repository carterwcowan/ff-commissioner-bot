import { generateStandings } from "../../fantasy/utilities/standings.js";
import { STANDINGS_FILE_NAME } from "../../constants.js";
import bot from "../bot.js";
const fs = require("fs");

const nodeHtmlToImage = require("node-html-to-image");

export async function handleCommand(event) {
  const { command, ack } = event;
  const week = command.text;
  await ack();

  let imagePath = `./assets/standings-week-${week}.png`;

  if (!checkFileExists(week)) {
    const standings = await generateStandings();
    const formattedTable = buildTable(standings, week);
    imagePath = await generateImage(formattedTable, week);
  }

  return await sendStandingsImg(imagePath, week);
}

function buildTable(standings, week) {
  const formatTableData = standings.map((team, i) => {
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

  return html;
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

async function generateImage(html, weekNumber) {
  const path = `./assets/standings-week-${weekNumber}.png`;
  await nodeHtmlToImage({
    output: path,
    selector: "table",
    html: html,
  });
  return path;
}

async function sendStandingsImg(imgPath, weekNumber) {
  try {
    console.log("TRY - sendings standings");

    // Call the files.upload method using the WebClient
    await bot.client.files.upload({
      // channels can be a list of one to many strings
      channels: "#commissioner-bot",
      initial_comment: `Here are the Week ${weekNumber} Standings`,
      // Include your filename in a ReadStream here
      file: fs.createReadStream(imgPath),
    });
  } catch (error) {
    console.error(error);
  }
}

function checkFileExists(weekNumber) {
  const path = `./assets/standings-week-${weekNumber}.png`;

  return fs.existsSync(path);
}
