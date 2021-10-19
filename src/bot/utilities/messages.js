import {
  BOT_ID,
  DICTIONARY,
  UNKNWOWN_PHRASES,
  INTRODUCTION,
  GREETINGS_REGEX,
} from "../../constants.js";

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

  if (DICTIONARY[searchText]) {
    return await say(DICTIONARY[searchText]);
  }
  if (searchText.match(GREETINGS_REGEX)) {
    return await say(`<@${message.user}> sup, nerd`);
  }
  return await say(getRandomResponse(UNKNWOWN_PHRASES));
}

export function getRandomResponse(phrases) {
  return phrases[Math.floor(Math.random() * phrases.length)];
}
