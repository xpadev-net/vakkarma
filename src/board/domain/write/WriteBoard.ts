import type { Result } from "neverthrow";
import { ok } from "neverthrow";
import type { WriteBoardName } from "../../../config/domain/write/WriteBoardName";
import type { WriteDefaultAuthorName } from "../../../config/domain/write/WriteDefaultAuthorName";
import type { WriteLocalRule } from "../../../config/domain/write/WriteLocalRule";
import type { WriteMaxContentLength } from "../../../config/domain/write/WriteMaxContentLength";
import type { WriteBoardId } from "./WriteBoardId";
import type { WriteBoardSlug } from "./WriteBoardSlug";

export type WriteBoard = {
  readonly _type: "WriteBoard";
  readonly id: WriteBoardId;
  readonly slug: WriteBoardSlug;
  readonly boardName: WriteBoardName;
  readonly localRule: WriteLocalRule;
  readonly defaultAuthorName: WriteDefaultAuthorName;
  readonly maxContentLength: WriteMaxContentLength;
  readonly orderIndex: number;
  readonly isActive: boolean;
  readonly isDefault: boolean;
};

export const createWriteBoard = ({
  id,
  slug,
  boardName,
  localRule,
  defaultAuthorName,
  maxContentLength,
  orderIndex,
  isActive,
  isDefault,
}: {
  id: WriteBoardId;
  slug: WriteBoardSlug;
  boardName: WriteBoardName;
  localRule: WriteLocalRule;
  defaultAuthorName: WriteDefaultAuthorName;
  maxContentLength: WriteMaxContentLength;
  orderIndex: number;
  isActive: boolean;
  isDefault: boolean;
}): Result<WriteBoard, Error> => {
  return ok({
    _type: "WriteBoard",
    id,
    slug,
    boardName,
    localRule,
    defaultAuthorName,
    maxContentLength,
    orderIndex,
    isActive,
    isDefault,
  });
};
