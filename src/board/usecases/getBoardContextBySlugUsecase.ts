import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import type { VakContext } from "../../shared/types/VakContext";
import { getBoardBySlugRepository } from "../repositories/getBoardBySlugRepository";
import type { BoardContext } from "../types/BoardContext";
import { boardToContext } from "./getDefaultBoardContextUsecase";

export const getBoardContextBySlugUsecase = async (
  vakContext: VakContext,
  slug: string,
): Promise<Result<BoardContext, Error>> => {
  const boardResult = await getBoardBySlugRepository(vakContext, slug);

  if (boardResult.isErr()) {
    return err(boardResult.error);
  }

  return ok(boardToContext(boardResult.value));
};
