import { generateStandings } from "../../../fantasy/utilities/standings";
import bot from "../../bot";
const fs = require("fs");

const nodeHtmlToImage = require("node-html-to-image");

export default async function handleStandings(event) {
  const { command, ack } = event;
  const { channel_id } = command;
  const week = command.text;
  await ack();

  let imagePath = `./assets/standings-week-${week}.png`;

  if (!checkFileExists(week)) {
    const standings = await generateStandings(week);
    const formattedTable = buildTable(standings, week);
    imagePath = await generateImage(formattedTable, week);
  }

  return await sendStandingsImg(imagePath, week, channel_id);
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
  const styles = `
  <style>
  table { border-collapse: collapse; }
  td { text-align: center; padding: .5rem 1rem; }
  </style>
  `;
  var result = styles + "<table border=1>";
  for (var i = 0; i < myArray.length; i++) {
    result += "<tr>";
    for (var j = 0; j < myArray[i].length; j++) {
      if (j === 0) {
        result += "<th align='center'>" + myArray[i][j] + "</th>";
      } else {
        result += "<td>" + myArray[i][j] + "</td>";
      }
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

async function sendStandingsImg(imgPath, weekNumber, channel) {
  try {
    console.log("TRY - sendings standings");
    // Call the files.upload method using the WebClient
    await bot.client.files.upload({
      // channels can be a list of one to many strings
      channels: channel,
      initial_comment: `*Standings After Week ${weekNumber}*`,
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
