import { err, ok, type Result } from "neverthrow";

import { getBoardByIdRepository } from "../repositories/getBoardByIdRepository";
import { setDefaultBoardRepository } from "../repositories/setDefaultBoardRepository";

import type { VakContext } from "../../shared/types/VakContext";
import type { ReadBoard } from "../domain/read/ReadBoard";

export const setDefaultBoardUsecase = async (
  vakContext: VakContext,
  boardId: string
): Promise<Result<ReadBoard, Error>> => {
  const boardResult = await getBoardByIdRepository(vakContext, boardId);
  if (boardResult.isErr()) {
    return err(boardResult.error);
  }

  if (!boardResult.value.isActive) {
    return err(new Error("無効化された板をデフォルトに設定できません"));
  }

  const updateResult = await setDefaultBoardRepository(vakContext, boardId);
  if (updateResult.isErr()) {
    return err(updateResult.error);
  }

  return ok(updateResult.value);
};

