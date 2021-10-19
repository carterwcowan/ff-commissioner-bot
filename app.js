import { awsLambdaReceiver } from "./src/bot/bot.js";
import dotenv from 'dotenv'

dotenv.config();
// (async (event, context, callback) => {
//   // Start your app
//   const handler = await bot.start();

//   return handler(event,context, callback);
// })();



export default async function handler(event, context, callback) {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};
