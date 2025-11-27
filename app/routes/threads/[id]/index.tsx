import { createRoute } from "honox/factory";

import { listBoardsUsecase } from "../../../../src/board/usecases/listBoardsUsecase";
import { getAllResponsesByThreadIdUsecase } from "../../../../src/conversation/usecases/getAllResponsesByThreadIdUsecase";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { ThreadPage } from "../../../components/ThreadPage";
import { resolveBoardContext } from "../../../utils/getBoardContext";

export default createRoute(async (c) => {
  const { sql, logger } = c.var;

  logger.info({
    operation: "threads/[id]/GET",
    path: c.req.path,
    method: c.req.method,
    message: "Thread detail page requested",
  });

  if (!sql) {
    logger.error({
      operation: "threads/[id]/GET",
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
      operation: "threads/[id]/GET",
      error: boardContextResult.error,
      message: "Failed to resolve board context",
    });
    c.status(500);
    return c.render(<ErrorMessage error={boardContextResult.error} />);
  }

  const id = c.req.param("id");

  if (!boardSlug) {
    return c.redirect(
      `/boards/${boardContextResult.value.slug}/threads/${id}`,
      302
    );
  }

  logger.debug({
    operation: "threads/[id]/GET",
    threadId: id,
    message: "Fetching thread responses",
  });

  const [boardsResult, allResponsesResult] = await Promise.all([
    listBoardsUsecase(vakContext),
    getAllResponsesByThreadIdUsecase(vakContext, boardContextResult.value, {
      threadIdRaw: id,
    }),
  ]);

  if (boardsResult.isErr()) {
    logger.error({
      operation: "threads/[id]/GET",
      error: boardsResult.error,
      message: "Failed to fetch board list",
    });
    return c.render(<ErrorMessage error={boardsResult.error} />);
  }
  if (allResponsesResult.isErr()) {
    logger.error({
      operation: "threads/[id]/GET",
      error: allResponsesResult.error,
      threadId: id,
      message: "Failed to fetch thread responses",
    });
    c.status(404);
    return c.render(<ErrorMessage error={allResponsesResult.error} />);
  }

  const latestResponseNumber =
    allResponsesResult.value.responses[
      allResponsesResult.value.responses.length - 1
    ].responseNumber.val;

  const boardLinks = boardsResult.value.map((board) => ({
    slug: board.slug.val,
    name: board.boardName.val,
  }));

  return c.render(
    <ThreadPage
      boardContext={boardContextResult.value}
      boards={boardLinks}
      thread={allResponsesResult.value.thread}
      responses={allResponsesResult.value.responses}
      latestResponseNumber={latestResponseNumber}
      acceptLanguage={c.req.header("Accept-Language") ?? undefined}
    />
  );
});
