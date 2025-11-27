import { createRoute } from "honox/factory";

import { createBoardUsecase } from "../../../../src/board/usecases/createBoardUsecase";
import { ErrorMessage } from "../../../components/ErrorMessage";

export const POST = createRoute(async (c) => {
  const { sql, logger } = c.var;

  if (!sql) {
    return c.render(
      <ErrorMessage error={new Error("DBに接続できませんでした")} />
    );
  }

  const body = await c.req.parseBody();
  const slug = typeof body.slug === "string" ? body.slug : "";
  const boardName = typeof body.boardName === "string" ? body.boardName : "";
  const localRule = typeof body.localRule === "string" ? body.localRule : "";
  const nanashiName =
    typeof body.nanashiName === "string" ? body.nanashiName : "";
  const maxContentLength = Number(body.maxContentLength);
  const orderIndex =
    typeof body.orderIndex === "string" && body.orderIndex.length > 0
      ? Number(body.orderIndex)
      : undefined;
  const isDefault = body.isDefault === "on";

  const vakContext = { sql, logger };

  const result = await createBoardUsecase(vakContext, {
    slugRaw: slug,
    boardNameRaw: boardName,
    localRuleRaw: localRule,
    defaultAuthorNameRaw: nanashiName,
    maxContentLengthRaw: maxContentLength,
    orderIndexRaw: orderIndex,
    isDefault,
  });

  if (result.isErr()) {
    return c.render(<ErrorMessage error={result.error} />);
  }

  return c.redirect("/admin", 303);
});

export default createRoute((c) => {
  c.status(405);
  return c.body(null);
});

