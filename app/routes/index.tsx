import { createRoute } from "honox/factory";

import { listBoardsUsecase } from "../../src/board/usecases/listBoardsUsecase";
import { getTopPageUsecase } from "../../src/conversation/usecases/getTopPageUsecase";
import { BoardTopPage } from "../components/BoardTopPage";
import { ErrorMessage } from "../components/ErrorMessage";
import { resolveBoardContext } from "../utils/getBoardContext";

export default createRoute(async (c) => {
  const { sql, logger } = c.var;
  const vakContext = { sql, logger };

  logger.info({
    operation: "index/GET",
    path: c.req.path,
    method: c.req.method,
    message: "Rendering top page",
  });

  logger.debug({
    operation: "index/GET",
    message: "Calling getTopPageUsecase to retrieve data",
  });

  const boardContextResult = await resolveBoardContext(vakContext);
  if (boardContextResult.isErr()) {
    logger.error({
      operation: "index/GET",
      error: boardContextResult.error,
      message: "Failed to resolve board context",
    });
    return c.render(<ErrorMessage error={boardContextResult.error} />);
  }

  const boardsResult = await listBoardsUsecase(vakContext);
  if (boardsResult.isErr()) {
    logger.error({
      operation: "index/GET",
      error: boardsResult.error,
      message: "Failed to retrieve board list",
    });
    return c.render(<ErrorMessage error={boardsResult.error} />);
  }

  const boardLinks = boardsResult.value.map((board) => ({
    slug: board.slug.val,
    name: board.boardName.val,
  }));

  const usecaseResult = await getTopPageUsecase(
    vakContext,
    boardContextResult.value,
  );

  if (usecaseResult.isErr()) {
    logger.error({
      operation: "index/GET",
      error: usecaseResult.error,
      message: "Failed to retrieve top page data",
    });
    return c.render(<ErrorMessage error={usecaseResult.error} />);
  }

  const { threadTop30, responsesTop10 } = usecaseResult.value;

  logger.debug({
    operation: "index/GET",
    threadCount: threadTop30.length,
    topThreadCount: responsesTop10.length,
    message: "Successfully retrieved top page data, rendering page",
  });

  return c.render(
    <BoardTopPage
      boardContext={boardContextResult.value}
      boards={boardLinks}
      threadTop30={threadTop30}
      responsesTop10={responsesTop10}
      acceptLanguage={c.req.header("Accept-Language") ?? undefined}
    />,
  );
});
