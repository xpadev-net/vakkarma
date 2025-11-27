import { createRoute } from "honox/factory";

import { setDefaultBoardUsecase } from "../../../../../src/board/usecases/setDefaultBoardUsecase";
import { ErrorMessage } from "../../../../components/ErrorMessage";

export const POST = createRoute(async (c) => {
  const { sql, logger } = c.var;
  const boardId = c.req.param("boardId");

  if (!boardId) {
    return c.render(<ErrorMessage error={new Error("板IDが指定されていません")} />);
  }

  if (!sql) {
    return c.render(
      <ErrorMessage error={new Error("DBに接続できませんでした")} />
    );
  }

  const result = await setDefaultBoardUsecase({ sql, logger }, boardId);
  if (result.isErr()) {
    return c.render(<ErrorMessage error={result.error} />);
  }

  return c.redirect("/admin", 303);
});

export default createRoute((c) => {
  c.status(405);
  return c.body(null);
});

