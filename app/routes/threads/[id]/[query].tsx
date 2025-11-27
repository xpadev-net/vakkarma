import { createRoute } from "honox/factory";

import { listBoardsUsecase } from "../../../../src/board/usecases/listBoardsUsecase";
import { getAllResponsesByThreadIdUsecase } from "../../../../src/conversation/usecases/getAllResponsesByThreadIdUsecase";
import { getLatestResponsesByThreadIdAndCountUsecase } from "../../../../src/conversation/usecases/getLatestResponsesByThreadIdAndCountUsecase";
import { getResponseByThreadIdAndResNumRangeUsecase } from "../../../../src/conversation/usecases/getResponseByThreadIdAndResNumRangeUsecase";
import { getResponseByThreadIdAndResNumUsecase } from "../../../../src/conversation/usecases/getResponseByThreadIdAndResNumUsecase";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { ThreadPage } from "../../../components/ThreadPage";
import { resolveBoardContext } from "../../../utils/getBoardContext";

import type { ReadThreadWithResponses } from "../../../../src/conversation/domain/read/ReadThreadWithResponses";
import type { Result } from "neverthrow";

export default createRoute(async (c) => {
  const { sql, logger } = c.var;

  logger.info({
    operation: "threads/[id]/[query]/GET",
    path: c.req.path,
    method: c.req.method,
    message: "Thread query page requested",
  });

  if (!sql) {
    logger.error({
      operation: "threads/[id]/[query]/GET",
      message: "Database connection not available",
    });
    c.status(500);
    return c.render(
      <ErrorMessage error={new Error("DBに接続できませんでした")} />
    );
  }

  const vakContext = { sql, logger };
  const boardSlug = c.req.param("boardSlug");

  const boardContextResult = await resolveBoardContext(vakContext, boardSlug);
  if (boardContextResult.isErr()) {
    logger.error({
      operation: "threads/[id]/[query]/GET",
      error: boardContextResult.error,
      message: "Failed to resolve board context",
    });
    c.status(404);
    return c.render(<ErrorMessage error={boardContextResult.error} />);
  }

  const boardContext = boardContextResult.value;

  const id = c.req.param("id");
  const queryString = c.req.param("query");

  if (!boardSlug) {
    return c.redirect(
      `/boards/${boardContext.slug}/threads/${id}/${queryString}`,
      302
    );
  }

  logger.debug({
    operation: "threads/[id]/[query]/GET",
    threadId: id,
    query: queryString,
    message: "Parsing query string and fetching responses",
  });

  let responsesResult: Result<ReadThreadWithResponses, Error>;

  if (queryString.startsWith("l") && /^l\d+$/.test(queryString)) {
    const count = parseInt(queryString.substring(1), 10);
    responsesResult = await getLatestResponsesByThreadIdAndCountUsecase(
      vakContext,
      boardContext,
      { threadIdRaw: id, countRaw: count }
    );
  } else if (/^\d+$/.test(queryString)) {
    const resNum = parseInt(queryString, 10);
    responsesResult = await getResponseByThreadIdAndResNumUsecase(
      vakContext,
      boardContext,
      { threadIdRaw: id, responseNumberRaw: resNum }
    );
  } else if (/^\d*-\d*$/.test(queryString)) {
    const [startStr, endStr] = queryString.split("-");
    const start = startStr ? parseInt(startStr, 10) : null;
    const end = endStr ? parseInt(endStr, 10) : null;
    responsesResult = await getResponseByThreadIdAndResNumRangeUsecase(
      vakContext,
      boardContext,
      {
        threadIdRaw: id,
        startResponseNumberRaw: start,
        endResponseNumberRaw: end,
      }
    );
  } else {
    responsesResult = await getAllResponsesByThreadIdUsecase(
      vakContext,
      boardContext,
      { threadIdRaw: id }
    );
  }

  if (responsesResult.isErr()) {
    logger.error({
      operation: "threads/[id]/[query]/GET",
      error: responsesResult.error,
      threadId: id,
      query: queryString,
      message: "Failed to fetch thread responses",
    });
    c.status(404);
    return c.render(<ErrorMessage error={responsesResult.error} />);
  }

  const boardsResult = await listBoardsUsecase(vakContext);
  if (boardsResult.isErr()) {
    logger.error({
      operation: "threads/[id]/[query]/GET",
      error: boardsResult.error,
      message: "Failed to retrieve board list",
    });
    return c.render(<ErrorMessage error={boardsResult.error} />);
  }

  const latestResponseNumber =
    responsesResult.value.responses[responsesResult.value.responses.length - 1]
      .responseNumber.val;

  const boardLinks = boardsResult.value.map((board) => ({
    slug: board.slug.val,
    name: board.boardName.val,
  }));

  return c.render(
    <ThreadPage
      boardContext={boardContext}
      boards={boardLinks}
      thread={responsesResult.value.thread}
      responses={responsesResult.value.responses}
      latestResponseNumber={latestResponseNumber}
      acceptLanguage={c.req.header("Accept-Language") ?? undefined}
    />
  );
});
