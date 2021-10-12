import { SCOLD_RESPOSNES } from "../../../constants";
import { getRandomResponse } from "../messages";

export default async function handleScold(event) {
  const { message, say } = event;
  const { ts, thread_ts } = message;

  return await say({
    thread_ts: thread_ts ? thread_ts : ts,
    text: getRandomResponse(SCOLD_RESPOSNES),
  });
}
