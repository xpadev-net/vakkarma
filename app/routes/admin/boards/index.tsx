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
  const slugRaw = typeof body.slug === "string" ? body.slug.trim() : "";
  const boardNameRaw =
    typeof body.boardName === "string" ? body.boardName.trim() : "";
  const localRuleRaw =
    typeof body.localRule === "string" ? body.localRule.trim() : "";
  const nanashiNameRaw =
    typeof body.nanashiName === "string" ? body.nanashiName.trim() : "";
  const maxLengthRaw =
    typeof body.maxContentLength === "string"
      ? body.maxContentLength.trim()
      : "";
  const orderIndexRaw =
    typeof body.orderIndex === "string" && body.orderIndex.trim().length > 0
      ? body.orderIndex.trim()
      : undefined;
  const isDefault = body.isDefault === "on";

  if (
    !slugRaw ||
    !boardNameRaw ||
    !localRuleRaw ||
    !nanashiNameRaw ||
    !maxLengthRaw
  ) {
    return c.render(
      <ErrorMessage error={new Error("すべての必須項目を入力してください")} />
    );
  }

  const maxContentLength = Number(maxLengthRaw);
  if (!Number.isFinite(maxContentLength) || maxContentLength <= 0) {
    return c.render(
      <ErrorMessage error={new Error("最大文字数は正の数で入力してください")} />
    );
  }

  const orderIndex =
    orderIndexRaw !== undefined ? Number(orderIndexRaw) : undefined;
  if (
    orderIndexRaw !== undefined &&
    (Number.isNaN(orderIndex) || !Number.isFinite(orderIndex))
  ) {
    return c.render(
      <ErrorMessage error={new Error("並び順は数値で入力してください")} />
    );
  }

  const vakContext = { sql, logger };

  const result = await createBoardUsecase(vakContext, {
    slugRaw,
    boardNameRaw,
    localRuleRaw,
    defaultAuthorNameRaw: nanashiNameRaw,
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

