import { err, ok, type Result } from "neverthrow";

import {
  DatabaseError,
  DataNotFoundError,
} from "../../shared/types/Error";

import { mapBoardRecordToDomain } from "./boardRecordMapper";

import type { VakContext } from "../../shared/types/VakContext";
import type { ReadBoard } from "../domain/read/ReadBoard";
import type { BoardRecord } from "./boardRecordMapper";

export const updateBoardRepository = async (
  { sql, logger }: VakContext,
  boardId: string,
  {
    slug,
    boardName,
    localRule,
    defaultAuthorName,
    maxContentLength,
    orderIndex,
  }: {
    slug: string;
    boardName: string;
    localRule: string;
    defaultAuthorName: string;
    maxContentLength: number;
    orderIndex: number;
  }
): Promise<Result<ReadBoard, DatabaseError | DataNotFoundError | Error>> => {
  logger.debug({
    operation: "updateBoardRepository",
    boardId,
    slug,
    boardName,
    message: "Updating board details",
  });

  try {
    const rows = await sql<BoardRecord[]>`
      UPDATE boards
      SET
        slug = ${slug},
        board_name = ${boardName},
        local_rule = ${localRule},
        nanashi_name = ${defaultAuthorName},
        max_content_length = ${maxContentLength},
        order_index = ${orderIndex},
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
        operation: "updateBoardRepository",
        boardId,
        message: "Board not found while updating",
      });
      return err(new DataNotFoundError("掲示板が見つかりませんでした"));
    }

    const mapped = mapBoardRecordToDomain(rows[0]);
    if (mapped.isErr()) {
      logger.error({
        operation: "updateBoardRepository",
        boardId,
        error: mapped.error,
        message: "Failed to convert updated board",
      });
      return err(mapped.error);
    }

    logger.info({
      operation: "updateBoardRepository",
      boardId: mapped.value.id.val,
      message: "Board updated successfully",
    });

    return ok(mapped.value);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({
      operation: "updateBoardRepository",
      boardId,
      error,
      message: `Database error while updating board: ${message}`,
    });
    return err(
      new DatabaseError(
        `掲示板の更新中にエラーが発生しました: ${message}`,
        error
      )
    );
  }
};

