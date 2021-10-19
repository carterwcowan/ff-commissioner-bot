import pkg from "@slack/bolt";

const { App, directMention, AwsLambdaReceiver } = pkg;
import handleStandings from "./utilities/commands/standings.js";
import handleSunday from "./utilities/commands/sunday.js";
import handleTradeReview from "./utilities/commands/trade-review.js";
import { handleMessage } from "./utilities/messages.js";
import handlePraise from "./utilities/messages/praise.js";
import handleScold from "./utilities/messages/scold.js";

export const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: `${process.env.SIGNING_SECRET}`,
});

const bot = new App({
  token: `${process.env.BOT_TOKEN}`,
  receiver: awsLambdaReceiver,
  processBeforeResponse: true
});



bot.message(directMention(), async (event) => await handleMessage(event));

bot.message('good bot', handlePraise);

bot.message('bad bot', handleScold);

bot.command("/standings", handleStandings);

bot.command("/trade-review", handleTradeReview);

bot.command('/sunday', handleSunday);

export default bot;
