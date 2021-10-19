import bot from "../../bot.js";

export default async function handleTradeReview(event) {
  const { command, ack, say } = event;
  const { text } = command;

  const teams = text.split(" ");

  await ack();
  const msg = await say(`
      A Trade between ${teams[0]} & ${teams[1]} has been brought to a vote!
      use :white_check_mark: to Approve, or
      use :X: to Veto
      `);

  const { ts, channel } = msg;

  await bot.client.reactions.add({
    name: "white_check_mark",
    channel: channel,
    timestamp: ts,
  });

  await bot.client.reactions.add({
    name: "x",
    channel: channel,
    timestamp: ts,
  });

  return msg;
}
