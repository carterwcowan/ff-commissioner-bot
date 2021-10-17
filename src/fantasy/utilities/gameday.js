import client from "../client";

export default async function gamedayInfo(start, end) {
  const games = await client.getNFLGamesForPeriod({
    startDate: start,
    endDate: end,
  });

  return games;
}
