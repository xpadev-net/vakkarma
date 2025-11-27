import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { getDefaultBoardRepository } from "../../board/repositories/getDefaultBoardRepository";

import type {
  DatabaseError,
  DataNotFoundError,
} from "../../shared/types/Error";
import type { VakContext } from "../../shared/types/VakContext";
import type { ReadMaxContentLength } from "../domain/read/ReadMaxContentLength";

export const getMaxContentLengthRepository = async ({
  sql,
  logger,
}: VakContext): Promise<
  Result<ReadMaxContentLength, DatabaseError | DataNotFoundError | Error>
> => {
  logger.debug({
    operation: "getMaxContentLength",
    message: "Fetching maximum content length from database",
  });

  const boardResult = await getDefaultBoardRepository({ sql, logger });

  if (boardResult.isErr()) {
    logger.error({
      operation: "getMaxContentLength",
      error: boardResult.error,
      message: "Failed to fetch default board information",
    });
    return err(boardResult.error);
  }

  logger.info({
    operation: "getMaxContentLength",
    maxContentLength: boardResult.value.maxContentLength.val,
    message: "Maximum content length retrieved and validated successfully",
  });

  return ok(boardResult.value.maxContentLength);
};
