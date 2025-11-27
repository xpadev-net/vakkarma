import { getBoardContextBySlugUsecase } from "../../src/board/usecases/getBoardContextBySlugUsecase";
import { getDefaultBoardContextUsecase } from "../../src/board/usecases/getDefaultBoardContextUsecase";

import type { BoardContext } from "../../src/board/types/BoardContext";
import type { VakContext } from "../../src/shared/types/VakContext";
import type { Result } from "neverthrow";

export const resolveBoardContext = (
  vakContext: VakContext,
  slug?: string
): Promise<Result<BoardContext, Error>> => {
  if (slug && slug.length > 0) {
    return getBoardContextBySlugUsecase(vakContext, slug);
  }

  return getDefaultBoardContextUsecase(vakContext);
};

