import bot from "./bot/bot.js";

(async () => {
  // Start your app
  await bot.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
