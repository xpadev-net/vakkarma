import { createRoute } from "honox/factory";

import { listBoardsUsecase } from "../../src/board/usecases/listBoardsUsecase";
import { getAllThreadsPageUsecase } from "../../src/conversation/usecases/getAllThreadsPageUsecase";
import { BoardLayout } from "../components/BoardLayout";
import { ErrorMessage } from "../components/ErrorMessage";
import { resolveBoardContext } from "../utils/getBoardContext";

export default createRoute(async (c) => {
  const { sql, logger } = c.var;
  const boardSlug = c.req.param("boardSlug");

  logger.info({
    operation: "subback/GET",
    path: c.req.path,
    method: c.req.method,
    message: "Rendering thread list page",
  });

  logger.debug({
    operation: "subback/GET",
    message: "Calling getAllThreadsPageUsecase to retrieve all threads",
  });

  const vakContext = { sql, logger };
  const boardContextResult = await resolveBoardContext(vakContext, boardSlug);
  if (boardContextResult.isErr()) {
    logger.error({
      operation: "subback/GET",
      error: boardContextResult.error,
      message: "Failed to resolve board context",
    });
    return c.render(<ErrorMessage error={boardContextResult.error} />);
  }

  if (!boardSlug) {
    return c.redirect(
      `/boards/${boardContextResult.value.slug}/subback.html`,
      302,
    );
  }

  const [boardsResult, usecaseResult] = await Promise.all([
    listBoardsUsecase(vakContext),
    getAllThreadsPageUsecase(vakContext, boardContextResult.value),
  ]);

  if (boardsResult.isErr()) {
    logger.error({
      operation: "subback/GET",
      error: boardsResult.error,
      message: "Failed to retrieve board list",
    });
    return c.render(<ErrorMessage error={boardsResult.error} />);
  }

  if (usecaseResult.isErr()) {
    logger.error({
      operation: "subback/GET",
      error: usecaseResult.error,
      message: "Failed to retrieve all threads",
    });
    return c.render(<ErrorMessage error={usecaseResult.error} />);
  }

  const threads = usecaseResult.value;
  const boardLinks = boardsResult.value.map((board) => ({
    slug: board.slug.val,
    name: board.boardName.val,
  }));
  const basePath = `/boards/${boardContextResult.value.slug}`;

  logger.debug({
    operation: "subback/GET",
    threadCount: threads.length,
    message: "Successfully retrieved all threads, rendering page",
  });

  return c.render(
    <BoardLayout boards={boardLinks} activeSlug={boardContextResult.value.slug}>
      <section className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">
          {boardContextResult.value.boardName} - スレッド一覧
        </h1>

        <p className="mb-4">全部で{threads.length}のスレッドがあります</p>

        <ul className="flex flex-col gap-2">
          {threads.map((thread, index) => (
            <li key={thread.id.val}>
              <a
                className="text-purple-600 hover:underline"
                href={`${basePath}/threads/${thread.id.val}/l50`}
              >
                {index + 1}: {thread.title.val} ({thread.countResponse})
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <a href={basePath} className="text-blue-600 hover:underline">
            掲示板に戻る
          </a>
        </div>
      </section>
    </BoardLayout>,
  );
});
