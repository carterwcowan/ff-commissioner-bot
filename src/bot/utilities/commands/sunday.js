import gamedayInfo from "../../../fantasy/utilities/gameday";
import { format } from "date-fns";

export default async function handleSunday(event) {
  const { command, ack, say } = event;
  const { text } = command;
  const timeline = text.split(" ");
  const [start, end] = timeline;

  await ack();

  const msg = await say(`
    Good luck to everyone today!
    `);

  const info = await gamedayInfo(start, end);

  const formattedData = formatGamedayData(info);

  await say(`Here are today's matchups (all times CST):
    ${formattedData}
    `);

  return msg;
}

function formatGamedayData(data) {
  const formatted = data.map(
    (game) => `
    ${format(game.startTime, "hh:mm a")} - ${game.awayTeam.teamAbbrev} at ${
      game.homeTeam.teamAbbrev
    } (${game.odds}) - ${game.broadcaster}`
  );

  return formatted.join(``);
}
