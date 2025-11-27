import { createRoute } from "honox/factory";

import { getAllThreadsWithEpochIdUsecase } from "../../../src/conversation/usecases/getAllThreadsWithEpochIdUsecase";
import { convertShiftJis } from "../../utils/convertShiftJis";
import { resolveBoardContext } from "../../utils/getBoardContext";

export default createRoute(async (c) => {
  const { sql, logger } = c.var;
  if (!sql) {
    return convertShiftJis("DBに接続できませんでした");
  }
  const vakContext = { sql, logger };
  const boardSlug = c.req.param("boardSlug");
  const boardContextResult = await resolveBoardContext(vakContext, boardSlug);
  if (boardContextResult.isErr()) {
    return convertShiftJis(
      `エラーが発生しました: ${boardContextResult.error.message}`,
    );
  }
  const threads = await getAllThreadsWithEpochIdUsecase(
    vakContext,
    boardContextResult.value,
  );
  if (threads.isErr()) {
    return convertShiftJis(`エラーが発生しました: ${threads.error.message}`);
  }

  let text = "";
  for (const thread of threads.value) {
    text += `${thread.threadEpochId.val}.dat<>${thread.title.val} (${thread.countResponse})\r\n`;
  }
  return convertShiftJis(text);
});
