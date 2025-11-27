import { err, ok, type Result } from "neverthrow";

import {
  DatabaseError,
  DataNotFoundError,
} from "../../shared/types/Error";

import { mapBoardRecordToDomain } from "./boardRecordMapper";

import type { VakContext } from "../../shared/types/VakContext";
import type { ReadBoard } from "../domain/read/ReadBoard";

export const setDefaultBoardRepository = async (
  { sql, logger }: VakContext,
  boardId: string
): Promise<Result<ReadBoard, DatabaseError | DataNotFoundError | Error>> => {
  logger.debug({
    operation: "setDefaultBoardRepository",
    boardId,
    message: "Setting board as default",
  });

  try {
    const result = await sql.begin(async (trx) => {
      await trx`
        UPDATE boards
        SET is_default = FALSE
        WHERE is_default = TRUE
      `;

      const rows = await trx`
        UPDATE boards
        SET
          is_default = TRUE,
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
        return err(new DataNotFoundError("掲示板が見つかりませんでした"));
      }

      await trx`
        UPDATE app_settings
        SET default_board_id = ${boardId}::uuid
        WHERE id = 1
      `;

      return ok(rows[0]);
    });

    if (result.isErr()) {
      return err(result.error);
    }

    const mapped = mapBoardRecordToDomain(result.value);
    if (mapped.isErr()) {
      logger.error({
        operation: "setDefaultBoardRepository",
        boardId,
        error: mapped.error,
        message: "Failed to convert default board result",
      });
      return err(mapped.error);
    }

    logger.info({
      operation: "setDefaultBoardRepository",
      boardId: mapped.value.id.val,
      message: "Board set as default successfully",
    });

    return ok(mapped.value);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({
      operation: "setDefaultBoardRepository",
      boardId,
      error,
      message: `Database error while setting default board: ${message}`,
    });
    return err(
      new DatabaseError(
        `デフォルト掲示板の更新中にエラーが発生しました: ${message}`,
        error
      )
    );
  }
};

