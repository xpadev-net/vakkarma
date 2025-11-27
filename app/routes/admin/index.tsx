import { createRoute } from "honox/factory";

import { listBoardsAdminUsecase } from "../../../src/board/usecases/listBoardsAdminUsecase";
import { ErrorMessage } from "../../components/ErrorMessage";

export default createRoute(async (c) => {
  const { sql, logger } = c.var;

  logger.info({
    operation: "admin/GET",
    path: c.req.path,
    method: c.req.method,
    message: "Admin board management page requested",
  });

  if (!sql) {
    logger.error({
      operation: "admin/GET",
      message: "Database connection not available",
    });
    return c.render(
      <ErrorMessage error={new Error("DBに接続できませんでした")} />
    );
  }

  const vakContext = { sql, logger };

  const boardsResult = await listBoardsAdminUsecase(vakContext);
  if (boardsResult.isErr()) {
    logger.error({
      operation: "admin/GET",
      error: boardsResult.error,
      message: "Failed to retrieve boards for admin page",
    });
    return c.render(<ErrorMessage error={boardsResult.error} />);
  }

  const boards = boardsResult.value;

  return c.render(
    <main className="container mx-auto flex-grow py-8 px-4 space-y-8">
      <section className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          管理者画面 - 板一覧
        </h1>
        <div className="space-y-6">
          {boards.map((board) => (
            <div
              key={board.id.val}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {board.boardName.val}
                    {board.isDefault && (
                      <span className="ml-2 rounded bg-purple-100 px-2 py-1 text-xs font-bold text-purple-700">
                        デフォルト
                      </span>
                    )}
                    {!board.isActive && (
                      <span className="ml-2 rounded bg-gray-200 px-2 py-1 text-xs font-bold text-gray-700">
                        無効
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    スラッグ: {board.slug.val} / 並び順: {board.orderIndex}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <form
                    method="post"
                    action={`/admin/boards/${board.id.val}/toggle`}
                  >
                    <input
                      type="hidden"
                      name="nextState"
                      value={board.isActive ? "inactive" : "active"}
                    />
                    <button
                      type="submit"
                      className={`rounded px-4 py-2 text-sm font-semibold text-white ${
                        board.isActive
                          ? "bg-orange-500 hover:bg-orange-600"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                      disabled={board.isDefault && board.isActive}
                    >
                      {board.isActive ? "無効化" : "有効化"}
                    </button>
                  </form>
                  <form
                    method="post"
                    action={`/admin/boards/${board.id.val}/default`}
                  >
                    <button
                      type="submit"
                      className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                      disabled={board.isDefault}
                    >
                      デフォルトに設定
                    </button>
                  </form>
                </div>
              </div>

              <form
                method="post"
                action={`/admin/boards/${board.id.val}`}
                className="mt-4 grid gap-4 md:grid-cols-2"
              >
                <label className="text-sm font-semibold text-gray-700">
                  スラッグ
                  <input
                    type="text"
                    name="slug"
                    defaultValue={board.slug.val}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    required
                  />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  掲示板名
                  <input
                    type="text"
                    name="boardName"
                    defaultValue={board.boardName.val}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    required
                  />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  ローカルルール
                  <input
                    type="text"
                    name="localRule"
                    defaultValue={board.localRule.val}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    required
                  />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  デフォルト名
                  <input
                    type="text"
                    name="nanashiName"
                    defaultValue={board.nanashiName.val}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    required
                  />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  最大文字数
                  <input
                    type="number"
                    name="maxContentLength"
                    min={1}
                    defaultValue={board.maxContentLength.val}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    required
                  />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  並び順
                  <input
                    type="number"
                    name="orderIndex"
                    defaultValue={board.orderIndex}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  />
                </label>
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="rounded bg-purple-600 px-6 py-2 font-semibold text-white hover:bg-purple-700"
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          新規板の作成
        </h2>
        <form method="post" action="/admin/boards" className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-gray-700">
            スラッグ
            <input
              type="text"
              name="slug"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            掲示板名
            <input
              type="text"
              name="boardName"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            ローカルルール
            <input
              type="text"
              name="localRule"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            デフォルト名
            <input
              type="text"
              name="nanashiName"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            最大文字数
            <input
              type="number"
              name="maxContentLength"
              min={1}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            並び順
            <input
              type="number"
              name="orderIndex"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" name="isDefault" className="h-4 w-4" />
            デフォルト板として登録
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="rounded bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700"
            >
              作成
            </button>
          </div>
        </form>
      </section>
    </main>
  );
});
