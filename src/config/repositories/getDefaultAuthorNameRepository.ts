import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { getDefaultBoardRepository } from "../../board/repositories/getDefaultBoardRepository";

import type {
  DatabaseError,
  DataNotFoundError,
} from "../../shared/types/Error";
import type { VakContext } from "../../shared/types/VakContext";
import type { ReadDefaultAuthorName } from "../domain/read/ReadDefaultAuthorName";

export const getDefaultAuthorNameRepository = async ({
  sql,
  logger,
}: VakContext): Promise<
  Result<ReadDefaultAuthorName, DatabaseError | DataNotFoundError | Error>
> => {
  logger.debug({
    operation: "getDefaultAuthorName",
    message: "Fetching default author name from database",
  });

  const boardResult = await getDefaultBoardRepository({ sql, logger });

  if (boardResult.isErr()) {
    logger.error({
      operation: "getDefaultAuthorName",
      error: boardResult.error,
      message: "Failed to fetch default board information",
    });
    return err(boardResult.error);
  }

  logger.info({
    operation: "getDefaultAuthorName",
    defaultAuthorName: boardResult.value.nanashiName.val,
    message: "Default author name retrieved and validated successfully",
  });

  return ok(boardResult.value.nanashiName);
};
