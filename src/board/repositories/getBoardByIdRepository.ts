import { err, ok, type Result } from "neverthrow";

import {
  DataNotFoundError,
  DatabaseError,
} from "../../shared/types/Error";

import {
  mapBoardRecordToDomain,
  type BoardRecord,
} from "./boardRecordMapper";

import type { VakContext } from "../../shared/types/VakContext";
import type { ReadBoard } from "../domain/read/ReadBoard";

export const getBoardByIdRepository = async (
  { sql, logger }: VakContext,
  boardId: string
): Promise<Result<ReadBoard, DatabaseError | DataNotFoundError>> => {
  logger.debug({
    operation: "getBoardByIdRepository",
    boardId,
    message: "Fetching board by ID",
  });

  try {
    const rows = await sql<BoardRecord[]>`
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
      WHERE id = ${boardId}::uuid
      LIMIT 1
    `;

    if (!rows || rows.length !== 1) {
      logger.warn({
        operation: "getBoardByIdRepository",
        boardId,
        message: "Board not found",
      });
      return err(new DataNotFoundError("指定された板が見つかりません"));
    }

    const boardResult = mapBoardRecordToDomain(rows[0]);
    if (boardResult.isErr()) {
      logger.error({
        operation: "getBoardByIdRepository",
        boardId,
        error: boardResult.error,
        message: "Failed to convert board record",
      });
      return err(boardResult.error);
    }

    return ok(boardResult.value);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({
      operation: "getBoardByIdRepository",
      boardId,
      error,
      message: `Database error while fetching board: ${message}`,
    });
    return err(
      new DatabaseError(
        `板情報の取得中にエラーが発生しました: ${message}`,
        error
      )
    );
  }
};

