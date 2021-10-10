
export async function handleCommand(event) {
  const { command, ack } = event;
  await ack();
  await sendStandingsImg(command.text);
}
