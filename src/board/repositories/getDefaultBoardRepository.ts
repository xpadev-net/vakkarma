import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { DatabaseError, DataNotFoundError } from "../../shared/types/Error";

import type { VakContext } from "../../shared/types/VakContext";
import type { ReadBoard } from "../domain/read/ReadBoard";
import { type BoardRecord, mapBoardRecordToDomain } from "./boardRecordMapper";

export const getDefaultBoardRepository = async ({
  sql,
  logger,
}: VakContext): Promise<
  Result<ReadBoard, DatabaseError | DataNotFoundError | Error>
> => {
  logger.debug({
    operation: "getDefaultBoardRepository",
    message: "Fetching default board from database",
  });

  try {
    const result = await sql<BoardRecord[]>`
      SELECT
        b.id,
        b.slug,
        b.board_name,
        b.local_rule,
        b.nanashi_name,
        b.max_content_length,
        b.is_active,
        b.is_default,
        b.order_index
      FROM boards AS b
      JOIN app_settings AS s
        ON s.default_board_id = b.id
      WHERE s.id = 1
        AND b.is_active = TRUE
      LIMIT 1
    `;

    if (!result || result.length !== 1) {
      logger.error({
        operation: "getDefaultBoardRepository",
        message: "Default board not found",
      });
      return err(new DataNotFoundError("デフォルト板の取得に失敗しました"));
    }

    const [record] = result;

    const boardResult = mapBoardRecordToDomain(record);

    if (boardResult.isErr()) {
      logger.error({
        operation: "getDefaultBoardRepository",
        error: boardResult.error,
        message: "Failed to create ReadBoard object",
      });
      return err(boardResult.error);
    }

    logger.info({
      operation: "getDefaultBoardRepository",
      boardId: boardResult.value.id.val,
      boardSlug: boardResult.value.slug.val,
      message: "Default board fetched successfully",
    });

    return ok(boardResult.value);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({
      operation: "getDefaultBoardRepository",
      error,
      message: `Database error while fetching default board: ${message}`,
    });
    return err(
      new DatabaseError(
        `デフォルト板取得中にエラーが発生しました: ${message}`,
        error,
      ),
    );
  }
};
