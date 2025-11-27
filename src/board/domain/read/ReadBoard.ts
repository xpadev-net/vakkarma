import type { Result } from "neverthrow";
import { ok } from "neverthrow";
import type { ReadBoardName } from "../../../config/domain/read/ReadBoardName";
import type { ReadDefaultAuthorName } from "../../../config/domain/read/ReadDefaultAuthorName";
import type { ReadLocalRule } from "../../../config/domain/read/ReadLocalRule";
import type { ReadMaxContentLength } from "../../../config/domain/read/ReadMaxContentLength";
import type { ReadBoardId } from "./ReadBoardId";
import type { ReadBoardSlug } from "./ReadBoardSlug";

export type ReadBoard = {
  readonly _type: "ReadBoard";
  readonly id: ReadBoardId;
  readonly slug: ReadBoardSlug;
  readonly boardName: ReadBoardName;
  readonly localRule: ReadLocalRule;
  readonly nanashiName: ReadDefaultAuthorName;
  readonly maxContentLength: ReadMaxContentLength;
  readonly isActive: boolean;
  readonly isDefault: boolean;
  readonly orderIndex: number;
};

export const createReadBoard = ({
  id,
  slug,
  boardName,
  localRule,
  nanashiName,
  maxContentLength,
  isActive,
  isDefault,
  orderIndex,
}: {
  id: ReadBoardId;
  slug: ReadBoardSlug;
  boardName: ReadBoardName;
  localRule: ReadLocalRule;
  nanashiName: ReadDefaultAuthorName;
  maxContentLength: ReadMaxContentLength;
  isActive: boolean;
  isDefault: boolean;
  orderIndex: number;
}): Result<ReadBoard, Error> => {
  return ok({
    _type: "ReadBoard",
    id,
    slug,
    boardName,
    localRule,
    nanashiName,
    maxContentLength,
    isActive,
    isDefault,
    orderIndex,
  });
};
