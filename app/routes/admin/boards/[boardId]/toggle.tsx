import { createRoute } from "honox/factory";

import { setBoardActiveStateUsecase } from "../../../../../src/board/usecases/setBoardActiveStateUsecase";
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

  const body = await c.req.parseBody();
  const nextState = body.nextState;
  const isActive = nextState !== "inactive";

  const result = await setBoardActiveStateUsecase(
    { sql, logger },
    { boardId, isActive }
  );

  if (result.isErr()) {
    return c.render(<ErrorMessage error={result.error} />);
  }

  return c.redirect("/admin", 303);
});

export default createRoute((c) => {
  c.status(405);
  return c.body(null);
});

