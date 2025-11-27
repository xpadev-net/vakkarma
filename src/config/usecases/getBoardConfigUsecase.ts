import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

import type { VakContext } from "../../shared/types/VakContext";
import type { ReadBoardConfig } from "../domain/read/ReadBoardConfig";
import { getBoardConfigRepository } from "../repositories/getBoardConfigRepository";

export const getBoardConfigUsecase = async (
  vakContext: VakContext,
): Promise<Result<ReadBoardConfig, Error>> => {
  const { logger } = vakContext;

  logger.debug({
    operation: "getBoardConfigUsecase",
    message: "Starting to fetch board configuration",
  });

  const config = await getBoardConfigRepository(vakContext);

  if (config.isErr()) {
    logger.error({
      operation: "getBoardConfigUsecase",
      error: config.error,
      message: "Failed to fetch board configuration",
    });
    return err(config.error);
  }

  logger.info({
    operation: "getBoardConfigUsecase",
    boardName: config.value.boardName.val,
    message: "Successfully retrieved board configuration",
  });

  return ok(config.value);
};
