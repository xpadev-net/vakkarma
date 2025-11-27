import { err, ok, type Result } from "neverthrow";

import { DatabaseError, DataNotFoundError } from "../../shared/types/Error";
import type { VakContext } from "../../shared/types/VakContext";
import type { ReadBoard } from "../domain/read/ReadBoard";
import { type BoardRecord, mapBoardRecordToDomain } from "./boardRecordMapper";

export const getBoardBySlugRepository = async (
  { sql, logger }: VakContext,
  slug: string,
): Promise<Result<ReadBoard, DatabaseError | DataNotFoundError | Error>> => {
  logger.debug({
    operation: "getBoardBySlugRepository",
    slug,
    message: "Fetching board by slug from database",
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
      WHERE b.slug = ${slug}
        AND b.is_active = TRUE
      LIMIT 1
    `;

    if (!result || result.length !== 1) {
      logger.warn({
        operation: "getBoardBySlugRepository",
        slug,
        message: "Board not found or inactive",
      });
      return err(new DataNotFoundError("指定された板が見つかりません"));
    }

    const boardResult = mapBoardRecordToDomain(result[0]);
    if (boardResult.isErr()) {
      logger.error({
        operation: "getBoardBySlugRepository",
        slug,
        error: boardResult.error,
        message: "Failed to convert board record",
      });
      return err(boardResult.error);
    }

    logger.info({
      operation: "getBoardBySlugRepository",
      slug,
      boardId: boardResult.value.id.val,
      message: "Board fetched successfully",
    });

    return ok(boardResult.value);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({
      operation: "getBoardBySlugRepository",
      slug,
      error,
      message: `Database error while fetching board: ${message}`,
    });
    return err(
      new DatabaseError(`板取得中にエラーが発生しました: ${message}`, error),
    );
  }
};
