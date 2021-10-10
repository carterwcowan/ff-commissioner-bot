import {
  BOT_ID,
  DICTIONARY,
  UNKNWOWN_PHRASES,
  INTRODUCTION,
  GREETINGS_REGEX,
} from "../../constants";

export async function handleMessage(event) {
  const { message, say } = event;
  const { text } = message;
  const searchText = text.replace(BOT_ID, "").toLowerCase().trim();

  console.log(searchText);

  if (searchText.indexOf("nap time") >= 0) {
    await say(`It's nap time, I'll be back later. . . `);
    return bot.stop();
  }

  if (searchText.indexOf("introduce yourself") >= 0) {
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

  if (DICTIONARY[searchText]) {
    return await say(DICTIONARY[searchText]);
  }
  if (searchText.match(GREETINGS_REGEX)) {
    return await say(`<@${message.user}> sup, nerd`);
  }
  return await say(getRandomResponse(UNKNWOWN_PHRASES));
}

function getRandomResponse(phrases) {
  return phrases[Math.floor(Math.random() * phrases.length)];
}
