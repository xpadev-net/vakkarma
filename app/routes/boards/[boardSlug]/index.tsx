import { createRoute } from "honox/factory";

import { listBoardsUsecase } from "../../../../src/board/usecases/listBoardsUsecase";
import { getTopPageUsecase } from "../../../../src/conversation/usecases/getTopPageUsecase";
import { BoardTopPage } from "../../../components/BoardTopPage";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { resolveBoardContext } from "../../../utils/getBoardContext";

export default createRoute(async (c) => {
  const { sql, logger } = c.var;
  const vakContext = { sql, logger };
  const boardSlug = c.req.param("boardSlug");

  logger.info({
    operation: "boards/[boardSlug]/GET",
    slug: boardSlug,
    message: "Rendering board-specific top page",
  });

  const boardContextResult = await resolveBoardContext(vakContext, boardSlug);
  if (boardContextResult.isErr()) {
    logger.error({
      operation: "boards/[boardSlug]/GET",
      slug: boardSlug,
      error: boardContextResult.error,
      message: "Failed to resolve board context",
    });
    c.status(404);
    return c.render(<ErrorMessage error={boardContextResult.error} />);
  }

  const [boardsResult, topPageResult] = await Promise.all([
    listBoardsUsecase(vakContext),
    getTopPageUsecase(vakContext, boardContextResult.value),
  ]);

  if (boardsResult.isErr()) {
    logger.error({
      operation: "boards/[boardSlug]/GET",
      slug: boardSlug,
      error: boardsResult.error,
      message: "Failed to fetch board list",
    });
    return c.render(<ErrorMessage error={boardsResult.error} />);
  }

  if (topPageResult.isErr()) {
    logger.error({
      operation: "boards/[boardSlug]/GET",
      slug: boardSlug,
      error: topPageResult.error,
      message: "Failed to fetch top page data",
    });
    return c.render(<ErrorMessage error={topPageResult.error} />);
  }

  const boardLinks = boardsResult.value.map((board) => ({
    slug: board.slug.val,
    name: board.boardName.val,
  }));

  return c.render(
    <BoardTopPage
      boardContext={boardContextResult.value}
      boards={boardLinks}
      threadTop30={topPageResult.value.threadTop30}
      responsesTop10={topPageResult.value.responsesTop10}
      acceptLanguage={c.req.header("Accept-Language") ?? undefined}
    />
  );
});

