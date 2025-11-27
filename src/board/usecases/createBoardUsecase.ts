import { err, ok, Result } from "neverthrow";

import {
  createWriteBoardName,
} from "../../config/domain/write/WriteBoardName";
import {
  createWriteDefaultAuthorName,
} from "../../config/domain/write/WriteDefaultAuthorName";
import {
  createWriteLocalRule,
} from "../../config/domain/write/WriteLocalRule";
import {
  createWriteMaxContentLength,
} from "../../config/domain/write/WriteMaxContentLength";
import { createWriteBoard } from "../domain/write/WriteBoard";
import { generateWriteBoardId } from "../domain/write/WriteBoardId";
import { createWriteBoardSlug } from "../domain/write/WriteBoardSlug";
import { createBoardRepository } from "../repositories/createBoardRepository";
import { setDefaultBoardRepository } from "../repositories/setDefaultBoardRepository";

import type { VakContext } from "../../shared/types/VakContext";
import type { ReadBoard } from "../domain/read/ReadBoard";

export const createBoardUsecase = async (
  vakContext: VakContext,
  {
    slugRaw,
    boardNameRaw,
    localRuleRaw,
    defaultAuthorNameRaw,
    maxContentLengthRaw,
    orderIndexRaw,
    isDefault,
  }: {
    slugRaw: string;
    boardNameRaw: string;
    localRuleRaw: string;
    defaultAuthorNameRaw: string;
    maxContentLengthRaw: number;
    orderIndexRaw?: number;
    isDefault: boolean;
  }
): Promise<Result<ReadBoard, Error>> => {
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

  const [
    slug,
    boardName,
    localRule,
    defaultAuthorName,
    maxContentLength,
  ] = validations.value;

  const orderIndex =
    typeof orderIndexRaw === "number" && !Number.isNaN(orderIndexRaw)
      ? orderIndexRaw
      : 0;

  const boardResult = createWriteBoard({
    id: generateWriteBoardId(),
    slug,
    boardName,
    localRule,
    defaultAuthorName,
    maxContentLength,
    orderIndex,
    isActive: true,
    isDefault,
  });

  if (boardResult.isErr()) {
    return err(boardResult.error);
  }

  const createdResult = await createBoardRepository(vakContext, boardResult.value);
  if (createdResult.isErr()) {
    return err(createdResult.error);
  }

  if (!isDefault) {
    return ok(createdResult.value);
  }

  const defaultResult = await setDefaultBoardRepository(
    vakContext,
    createdResult.value.id.val
  );
  if (defaultResult.isErr()) {
    return err(defaultResult.error);
  }

  return ok(defaultResult.value);
};

