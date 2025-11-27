import { err, ok, type Result } from "neverthrow";

import { getBoardByIdRepository } from "../repositories/getBoardByIdRepository";
import { updateBoardActiveStateRepository } from "../repositories/updateBoardActiveStateRepository";

import type { VakContext } from "../../shared/types/VakContext";
import type { ReadBoard } from "../domain/read/ReadBoard";

export const setBoardActiveStateUsecase = async (
  vakContext: VakContext,
  {
    boardId,
    isActive,
  }: {
    boardId: string;
    isActive: boolean;
  }
): Promise<Result<ReadBoard, Error>> => {
  const boardResult = await getBoardByIdRepository(vakContext, boardId);
  if (boardResult.isErr()) {
    return err(boardResult.error);
  }

  if (!isActive && boardResult.value.isDefault) {
    return err(new Error("デフォルト板は無効化できません"));
  }

  const updateResult = await updateBoardActiveStateRepository(vakContext, {
    boardId,
    isActive,
  });

  if (updateResult.isErr()) {
    return err(updateResult.error);
  }

  return ok(updateResult.value);
};

