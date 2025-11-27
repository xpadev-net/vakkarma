import { err, ok } from "neverthrow";
import type { BoardContext } from "../../board/types/BoardContext";
import type { VakContext } from "../../shared/types/VakContext";
import { getAllThreadsRepository } from "../repositories/getAllThreadsRepository";

// すべてのスレッドを取得するユースケース
export const getAllThreadsPageUsecase = async (
  vakContext: VakContext,
  boardContext: BoardContext,
) => {
  const { logger } = vakContext;

  logger.info({
    operation: "getAllThreadsPage",
    message: "Starting all threads retrieval",
  });

  logger.debug({
    operation: "getAllThreadsPage",
    message: "Fetching all threads from repository",
  });

  const threadsResult = await getAllThreadsRepository(vakContext, {
    boardId: boardContext.boardId,
  });
  if (threadsResult.isErr()) {
    logger.error({
      operation: "getAllThreadsPage",
      error: threadsResult.error,
      message: "Failed to fetch all threads",
    });
    return err(threadsResult.error);
  }

  logger.info({
    operation: "getAllThreadsPage",
    threadCount: threadsResult.value.length,
    message: "Successfully retrieved all threads",
  });

  return ok(threadsResult.value);
};
