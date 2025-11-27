import { err, ok } from "neverthrow";
import type { BoardContext } from "../../board/types/BoardContext";
import type { VakContext } from "../../shared/types/VakContext";
import { getAllThreadsWithEpochIdRepository } from "../repositories/getAllThreadsWithEpochIdRepository";

export const getAllThreadsWithEpochIdUsecase = async (
  vakContext: VakContext,
  boardContext: BoardContext,
) => {
  const { logger } = vakContext;

  logger.info({
    operation: "getAllThreadsWithEpochId",
    message: "Starting all threads with epoch ID retrieval",
  });

  logger.debug({
    operation: "getAllThreadsWithEpochId",
    message: "Fetching threads with epoch IDs from repository",
  });

  const threads = await getAllThreadsWithEpochIdRepository(vakContext, {
    boardId: boardContext.boardId,
  });
  if (threads.isErr()) {
    logger.error({
      operation: "getAllThreadsWithEpochId",
      error: threads.error,
      message: "Failed to fetch threads with epoch IDs",
    });
    return err(threads.error);
  }

  logger.info({
    operation: "getAllThreadsWithEpochId",
    threadCount: threads.value.length,
    message: "Successfully retrieved all threads with epoch IDs",
  });

  return ok(threads.value);
};
