import { err, ok, type Result } from "neverthrow";

import { listBoardsRepository } from "../repositories/listBoardsRepository";

import type { VakContext } from "../../shared/types/VakContext";
import type { ReadBoard } from "../domain/read/ReadBoard";

export const listBoardsAdminUsecase = async (
  vakContext: VakContext
): Promise<Result<ReadBoard[], Error>> => {
  const boardsResult = await listBoardsRepository(vakContext, {
    includeInactive: true,
  });

  if (boardsResult.isErr()) {
    return err(boardsResult.error);
  }

  return ok(boardsResult.value);
};

