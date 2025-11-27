import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { getDefaultBoardRepository } from "../../board/repositories/getDefaultBoardRepository";

import type {
  DatabaseError,
  DataNotFoundError,
} from "../../shared/types/Error";
import type { VakContext } from "../../shared/types/VakContext";
import {
  createReadBoardConfig,
  type ReadBoardConfig,
} from "../domain/read/ReadBoardConfig";

export const getBoardConfigRepository = async ({
  sql,
  logger,
}: VakContext): Promise<
  Result<ReadBoardConfig, DatabaseError | DataNotFoundError | Error>
> => {
  logger.debug({
    operation: "getBoardConfig",
    message: "Fetching board configuration from database",
  });

  const boardResult = await getDefaultBoardRepository({ sql, logger });

  if (boardResult.isErr()) {
    logger.error({
      operation: "getBoardConfig",
      error: boardResult.error,
      message: "Failed to fetch default board configuration",
    });
    return err(boardResult.error);
  }

  const config = createReadBoardConfig({
    boardName: boardResult.value.boardName,
    localRule: boardResult.value.localRule,
  });
  if (config.isErr()) {
    logger.error({
      operation: "getBoardConfig",
      error: config.error,
      message: "Failed to create board config object",
    });
    return err(config.error);
  }

  logger.info({
    operation: "getBoardConfig",
    boardName: boardResult.value.boardName.val,
    message: "Board configuration retrieved and validated successfully",
  });

  return ok(config.value);
};
