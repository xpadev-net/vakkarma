import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { DatabaseError } from "../../shared/types/Error";
import type { VakContext } from "../../shared/types/VakContext";
import type { WriteNormalConfig } from "../domain/write/WriteNormalConfig";

export const updateNormalConfigRepository = async (
  { sql, logger }: VakContext,
  config: WriteNormalConfig,
): Promise<Result<undefined, Error>> => {
  const { boardName, localRule, defaultAuthorName, maxContentLength } = config;

  logger.debug({
    operation: "updateNormalConfig",
    boardName: boardName.val,
    defaultAuthorName: defaultAuthorName.val,
    maxContentLength: maxContentLength.val,
    message: "Updating configuration in database",
  });

  try {
    const result = await sql<{ id: string }[]>`
            UPDATE
                boards
            SET
                board_name = ${boardName.val},
                local_rule = ${localRule.val},
                nanashi_name = ${defaultAuthorName.val},
                max_content_length = ${maxContentLength.val},
                updated_at = NOW()
            WHERE
                id = (
                    SELECT default_board_id FROM app_settings WHERE id = 1
                )
            RETURNING id
        `;

    if (!result || result.length !== 1) {
      logger.error({
        operation: "updateNormalConfig",
        message: "Failed to update default board row",
      });
      return err(new DatabaseError("設定の更新に失敗しました"));
    }

    logger.info({
      operation: "updateNormalConfig",
      boardName: boardName.val,
      message: "Configuration updated successfully in database",
    });

    return ok(undefined);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({
      operation: "updateNormalConfig",
      error,
      message: `Database error while updating configuration: ${message}`,
    });
    return err(
      new DatabaseError(
        `設定の更新中にエラーが発生しました: ${message}`,
        error,
      ),
    );
  }
};
