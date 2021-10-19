import { PRAISE_RESPONSES } from "../../../constants.js";
import { getRandomResponse } from "../messages.js";

export default async function handlePraise(event) {
  const { message, say } = event;
  const { ts, thread_ts } = message;

  return await say({
    thread_ts: thread_ts ? thread_ts : ts,
    text: getRandomResponse(PRAISE_RESPONSES),
  });
}
