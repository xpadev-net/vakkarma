import { err, ok } from "neverthrow";

import { getBoardBySlugRepository } from "../repositories/getBoardBySlugRepository";

import { boardToContext } from "./getDefaultBoardContextUsecase";

import type { VakContext } from "../../shared/types/VakContext";
import type { BoardContext } from "../types/BoardContext";
import type { Result } from "neverthrow";

export const getBoardContextBySlugUsecase = async (
  vakContext: VakContext,
  slug: string
): Promise<Result<BoardContext, Error>> => {
  const boardResult = await getBoardBySlugRepository(vakContext, slug);

  if (boardResult.isErr()) {
    return err(boardResult.error);
  }

  return ok(boardToContext(boardResult.value));
};

