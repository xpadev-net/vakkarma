import { err, ok } from "neverthrow";

import { getDefaultBoardRepository } from "../repositories/getDefaultBoardRepository";

import type { VakContext } from "../../shared/types/VakContext";
import type { BoardContext } from "../types/BoardContext";
import type { Result } from "neverthrow";

const mapToBoardContext = (board: {
  id: { val: string };
  slug: { val: string };
  boardName: { val: string };
  localRule: { val: string };
  nanashiName: { val: string };
  maxContentLength: { val: number };
}): BoardContext => {
  return {
    boardId: board.id.val,
    slug: board.slug.val,
    boardName: board.boardName.val,
    localRule: board.localRule.val,
    defaultAuthorName: board.nanashiName.val,
    maxContentLength: board.maxContentLength.val,
  };
};

export const getDefaultBoardContextUsecase = async (
  vakContext: VakContext
): Promise<Result<BoardContext, Error>> => {
  const boardResult = await getDefaultBoardRepository(vakContext);

  if (boardResult.isErr()) {
    return err(boardResult.error);
  }

  return ok(mapToBoardContext(boardResult.value));
};

export const boardToContext = mapToBoardContext;

