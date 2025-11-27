import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { getDefaultBoardRepository } from "../../board/repositories/getDefaultBoardRepository";

import type { DatabaseError } from "../../shared/types/Error";
import type { VakContext } from "../../shared/types/VakContext";
import {
  createReadNormalConfig,
  type ReadNormalConfig,
} from "../domain/read/ReadNormalConfig";

export const getNormalConfigRepository = async ({
  sql,
  logger,
}: VakContext): Promise<Result<ReadNormalConfig, DatabaseError | Error>> => {
  logger.debug({
    operation: "getNormalConfig",
    message: "Fetching board configuration from database",
  });

  const boardResult = await getDefaultBoardRepository({ sql, logger });

  if (boardResult.isErr()) {
    logger.error({
      operation: "getNormalConfig",
      error: boardResult.error,
      message: "Failed to fetch default board data",
    });
    return err(boardResult.error);
  }

  const normalConfigResult = createReadNormalConfig({
    boardName: boardResult.value.boardName,
    localRule: boardResult.value.localRule,
    defaultAuthorName: boardResult.value.nanashiName,
    maxContentLength: boardResult.value.maxContentLength,
  });

  if (normalConfigResult.isErr()) {
    logger.error({
      operation: "getNormalConfig",
      error: normalConfigResult.error,
      message: "Failed to create ReadNormalConfig object",
    });
    return err(normalConfigResult.error);
  }

  logger.info({
    operation: "getNormalConfig",
    boardName: normalConfigResult.value.boardName.val,
    message: "Configuration retrieved successfully",
  });

  return ok(normalConfigResult.value);
};
