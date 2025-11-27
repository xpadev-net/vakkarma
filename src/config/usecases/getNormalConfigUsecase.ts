import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

import type { VakContext } from "../../shared/types/VakContext";
import type { ReadNormalConfig } from "../domain/read/ReadNormalConfig";
import { getNormalConfigRepository } from "../repositories/getNormalConfigRepository";

export const getNormalConfigUsecase = async (
  vakContext: VakContext,
): Promise<Result<ReadNormalConfig, Error>> => {
  const { logger } = vakContext;

  logger.info({
    operation: "getConfig",
    message: "Starting configuration retrieval",
  });

  logger.debug({
    operation: "getConfig",
    message: "Fetching configuration from repository",
  });

  const config = await getNormalConfigRepository(vakContext);
  if (config.isErr()) {
    logger.error({
      operation: "getConfig",
      error: config.error,
      message: "Failed to fetch configuration",
    });
    return err(config.error);
  }

  logger.info({
    operation: "getConfig",
    boardName: config.value.boardName.val,
    message: "Configuration retrieved successfully",
  });

  return ok(config.value);
};
