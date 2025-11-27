import { err, Result } from "neverthrow";

import { createReadBoardName } from "../../config/domain/read/ReadBoardName";
import { createReadDefaultAuthorName } from "../../config/domain/read/ReadDefaultAuthorName";
import { createReadLocalRule } from "../../config/domain/read/ReadLocalRule";
import { createReadMaxContentLength } from "../../config/domain/read/ReadMaxContentLength";
import type { ReadBoard } from "../domain/read/ReadBoard";
import { createReadBoard } from "../domain/read/ReadBoard";
import { createReadBoardId } from "../domain/read/ReadBoardId";
import { createReadBoardSlug } from "../domain/read/ReadBoardSlug";

export type BoardRecord = {
  id: string;
  slug: string;
  board_name: string;
  local_rule: string;
  nanashi_name: string;
  max_content_length: number;
  is_active: boolean;
  is_default: boolean;
  order_index: number;
};

export const mapBoardRecordToDomain = (
  record: BoardRecord,
): Result<ReadBoard, Error> => {
  const converted = Result.combine([
    createReadBoardId(record.id),
    createReadBoardSlug(record.slug),
    createReadBoardName(record.board_name),
    createReadLocalRule(record.local_rule),
    createReadDefaultAuthorName(record.nanashi_name),
    createReadMaxContentLength(record.max_content_length),
  ]);

  if (converted.isErr()) {
    return err(converted.error);
  }

  const [
    boardId,
    slug,
    boardName,
    localRule,
    defaultAuthorName,
    maxContentLength,
  ] = converted.value;

  return createReadBoard({
    id: boardId,
    slug,
    boardName,
    localRule,
    nanashiName: defaultAuthorName,
    maxContentLength,
    isActive: record.is_active,
    isDefault: record.is_default,
    orderIndex: record.order_index,
  });
};
