import { createRoute } from "honox/factory";

import { listBoardsUsecase } from "../../../../src/board/usecases/listBoardsUsecase";
import { getAllThreadsPageUsecase } from "../../../../src/conversation/usecases/getAllThreadsPageUsecase";
import { BoardLayout } from "../../../components/BoardLayout";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { resolveBoardContext } from "../../../utils/getBoardContext";

export default createRoute(async (c) => {
  const { sql, logger } = c.var;
  const boardSlug = c.req.param("boardSlug");
  const vakContext = { sql, logger };

  const boardContextResult = await resolveBoardContext(vakContext, boardSlug);
  if (boardContextResult.isErr()) {
    c.status(404);
    return c.render(<ErrorMessage error={boardContextResult.error} />);
  }

  const [boardsResult, usecaseResult] = await Promise.all([
    listBoardsUsecase(vakContext),
    getAllThreadsPageUsecase(vakContext, boardContextResult.value),
  ]);

  if (boardsResult.isErr()) {
    return c.render(<ErrorMessage error={boardsResult.error} />);
  }

  if (usecaseResult.isErr()) {
    return c.render(<ErrorMessage error={usecaseResult.error} />);
  }

  const boardLinks = boardsResult.value.map((board) => ({
    slug: board.slug.val,
    name: board.boardName.val,
  }));

  const threads = usecaseResult.value;
  const basePath = `/boards/${boardContextResult.value.slug}`;

  return c.render(
    <BoardLayout
      boards={boardLinks}
      activeSlug={boardContextResult.value.slug}
    >
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
    </BoardLayout>
  );
});

