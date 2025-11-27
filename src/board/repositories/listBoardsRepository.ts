import { err, ok, type Result } from "neverthrow";

import { DatabaseError } from "../../shared/types/Error";
import type { VakContext } from "../../shared/types/VakContext";
import type { ReadBoard } from "../domain/read/ReadBoard";
import { type BoardRecord, mapBoardRecordToDomain } from "./boardRecordMapper";

export const listBoardsRepository = async (
  { sql, logger }: VakContext,
  { includeInactive = false }: { includeInactive?: boolean } = {},
): Promise<Result<ReadBoard[], DatabaseError | Error>> => {
  logger.debug({
    operation: "listBoardsRepository",
    includeInactive,
    message: includeInactive
      ? "Fetching all boards (including inactive)"
      : "Fetching active boards list",
  });

  try {
    const rows = includeInactive
      ? await sql<BoardRecord[]>`
      SELECT
        id,
        slug,
        board_name,
        local_rule,
        nanashi_name,
        max_content_length,
        is_active,
        is_default,
        order_index
      FROM boards
      ORDER BY order_index ASC, created_at ASC
    `
      : await sql<BoardRecord[]>`
      SELECT
        id,
        slug,
        board_name,
        local_rule,
        nanashi_name,
        max_content_length,
        is_active,
        is_default,
        order_index
      FROM boards
      WHERE is_active = TRUE
      ORDER BY order_index ASC, created_at ASC
    `;

    const boards: ReadBoard[] = [];
    for (const row of rows) {
      const boardResult = mapBoardRecordToDomain(row);
      if (boardResult.isErr()) {
        logger.error({
          operation: "listBoardsRepository",
          boardId: row.id,
          error: boardResult.error,
          message: "Failed to convert board record",
        });
        return err(boardResult.error);
      }

      boards.push(boardResult.value);
    }

    logger.info({
      operation: "listBoardsRepository",
      boardCount: boards.length,
      includeInactive,
      message: "Successfully fetched boards",
    });

    return ok(boards);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({
      operation: "listBoardsRepository",
      error,
      message: `Database error while listing boards: ${message}`,
    });
    return err(
      new DatabaseError(
        `掲示板一覧の取得中にエラーが発生しました: ${message}`,
        error,
      ),
    );
  }
};
