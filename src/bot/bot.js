import { App as SlackBot, directMention } from "@slack/bolt";
import handleStandings from "./utilities/commands/standings";
import handleTradeReview from "./utilities/commands/trade-review";
import { handleMessage } from "./utilities/messages";
import handlePraise from "./utilities/messages/praise";
import handleScold from "./utilities/messages/scold";

require("dotenv").config();

const bot = new SlackBot({
  token: `${process.env.BOT_TOKEN}`,
  signingSecret: `${process.env.SIGNING_SECRET}`,
  socketMode: true,
  appToken: `${process.env.APP_TOKEN}`,
});

bot.message(directMention(), async (event) => await handleMessage(event));

bot.message('good bot', handlePraise);

bot.message('bad bot', handleScold);

bot.command("/standings", handleStandings);

bot.command("/trade-review", handleTradeReview);

export default bot;
