import { err, ok, type Result } from "neverthrow";

import { DatabaseError } from "../../shared/types/Error";
import type { VakContext } from "../../shared/types/VakContext";
import type { ReadBoard } from "../domain/read/ReadBoard";
import type { WriteBoard } from "../domain/write/WriteBoard";
import type { BoardRecord } from "./boardRecordMapper";
import { mapBoardRecordToDomain } from "./boardRecordMapper";

export const createBoardRepository = async (
  { sql, logger }: VakContext,
  board: WriteBoard,
): Promise<Result<ReadBoard, DatabaseError | Error>> => {
  logger.debug({
    operation: "createBoardRepository",
    slug: board.slug.val,
    boardName: board.boardName.val,
    message: "Creating new board",
  });

  try {
    const rows = await sql<BoardRecord[]>`
      INSERT INTO boards(
        id,
        slug,
        board_name,
        local_rule,
        nanashi_name,
        max_content_length,
        is_active,
        is_default,
        order_index
      )
      VALUES(
        ${board.id.val}::uuid,
        ${board.slug.val},
        ${board.boardName.val},
        ${board.localRule.val},
        ${board.defaultAuthorName.val},
        ${board.maxContentLength.val},
        ${board.isActive},
        ${board.isDefault},
        ${board.orderIndex}
      )
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
      logger.error({
        operation: "createBoardRepository",
        boardId: board.id.val,
        message: "Failed to insert board, invalid database response",
      });
      return err(new DatabaseError("掲示板の作成に失敗しました"));
    }

    const mapped = mapBoardRecordToDomain(rows[0]);
    if (mapped.isErr()) {
      logger.error({
        operation: "createBoardRepository",
        boardId: board.id.val,
        error: mapped.error,
        message: "Failed to convert inserted board",
      });
      return err(mapped.error);
    }

    logger.info({
      operation: "createBoardRepository",
      boardId: mapped.value.id.val,
      message: "Board created successfully",
    });

    return ok(mapped.value);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({
      operation: "createBoardRepository",
      boardId: board.id.val,
      error,
      message: `Database error while creating board: ${message}`,
    });
    return err(
      new DatabaseError(
        `掲示板の作成中にエラーが発生しました: ${message}`,
        error,
      ),
    );
  }
};
