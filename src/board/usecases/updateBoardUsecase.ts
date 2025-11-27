import { err, ok, Result } from "neverthrow";

import { createWriteBoardName } from "../../config/domain/write/WriteBoardName";
import { createWriteDefaultAuthorName } from "../../config/domain/write/WriteDefaultAuthorName";
import { createWriteLocalRule } from "../../config/domain/write/WriteLocalRule";
import { createWriteMaxContentLength } from "../../config/domain/write/WriteMaxContentLength";
import type { VakContext } from "../../shared/types/VakContext";
import type { ReadBoard } from "../domain/read/ReadBoard";
import { createWriteBoardSlug } from "../domain/write/WriteBoardSlug";
import { getBoardByIdRepository } from "../repositories/getBoardByIdRepository";
import { updateBoardRepository } from "../repositories/updateBoardRepository";

export const updateBoardUsecase = async (
  vakContext: VakContext,
  {
    boardId,
    slugRaw,
    boardNameRaw,
    localRuleRaw,
    defaultAuthorNameRaw,
    maxContentLengthRaw,
    orderIndexRaw,
  }: {
    boardId: string;
    slugRaw: string;
    boardNameRaw: string;
    localRuleRaw: string;
    defaultAuthorNameRaw: string;
    maxContentLengthRaw: number;
    orderIndexRaw?: number;
  },
): Promise<Result<ReadBoard, Error>> => {
  const existingBoardResult = await getBoardByIdRepository(vakContext, boardId);
  if (existingBoardResult.isErr()) {
    return err(existingBoardResult.error);
  }

  const validations = Result.combine([
    createWriteBoardSlug(slugRaw),
    createWriteBoardName(boardNameRaw),
    createWriteLocalRule(localRuleRaw),
    createWriteDefaultAuthorName(defaultAuthorNameRaw),
    createWriteMaxContentLength(maxContentLengthRaw),
  ]);

  if (validations.isErr()) {
    return err(validations.error);
  }

  const orderIndex =
    typeof orderIndexRaw === "number" && !Number.isNaN(orderIndexRaw)
      ? orderIndexRaw
      : existingBoardResult.value.orderIndex;

  const updateResult = await updateBoardRepository(vakContext, boardId, {
    slug: validations.value[0].val,
    boardName: validations.value[1].val,
    localRule: validations.value[2].val,
    defaultAuthorName: validations.value[3].val,
    maxContentLength: validations.value[4].val,
    orderIndex,
  });

  if (updateResult.isErr()) {
    return err(updateResult.error);
  }

  return ok(updateResult.value);
};
