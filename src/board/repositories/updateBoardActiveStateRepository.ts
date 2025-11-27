import { err, ok, type Result } from "neverthrow";

import {
  DatabaseError,
  DataNotFoundError,
} from "../../shared/types/Error";

import { mapBoardRecordToDomain } from "./boardRecordMapper";

import type { BoardRecord } from "./boardRecordMapper";
import type { VakContext } from "../../shared/types/VakContext";
import type { ReadBoard } from "../domain/read/ReadBoard";

export const updateBoardActiveStateRepository = async (
  { sql, logger }: VakContext,
  {
    boardId,
    isActive,
  }: {
    boardId: string;
    isActive: boolean;
  }
): Promise<Result<ReadBoard, DatabaseError | DataNotFoundError | Error>> => {
  logger.debug({
    operation: "updateBoardActiveStateRepository",
    boardId,
    isActive,
    message: "Updating board active state",
  });

  try {
    const rows = await sql<BoardRecord[]>`
      UPDATE boards
      SET
        is_active = ${isActive},
        updated_at = NOW()
      WHERE id = ${boardId}::uuid
      RETURNING
        id,
        slug,
        board_name,
        local_rule,
        nanashi_name,
        max_content_length,
        is_active,
        is_default,
        order_index
    `;

    if (!rows || rows.length !== 1) {
      logger.warn({
        operation: "updateBoardActiveStateRepository",
        boardId,
        message: "Board not found while updating active state",
      });
      return err(new DataNotFoundError("掲示板が見つかりませんでした"));
    }

    const mapped = mapBoardRecordToDomain(rows[0]);
    if (mapped.isErr()) {
      logger.error({
        operation: "updateBoardActiveStateRepository",
        boardId,
        error: mapped.error,
        message: "Failed to convert updated board",
      });
      return err(mapped.error);
    }

    logger.info({
      operation: "updateBoardActiveStateRepository",
      boardId: mapped.value.id.val,
      isActive: mapped.value.isActive,
      message: "Board active state updated",
    });

    return ok(mapped.value);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({
      operation: "updateBoardActiveStateRepository",
      boardId,
      error,
      message: `Database error while updating board state: ${message}`,
    });
    return err(
      new DatabaseError(
        `掲示板の状態更新中にエラーが発生しました: ${message}`,
        error
      )
    );
  }
};

