import { err, ok } from "neverthrow";
import { uuidv7 } from "uuidv7";

import { ValidationError } from "../../../shared/types/Error";
import { validateUUIDv7 } from "../../../shared/utils/validateUUIDv7";

import type { Result } from "neverthrow";

export type WriteBoardId = {
  readonly _type: "WriteBoardId";
  readonly val: string;
};

export const generateWriteBoardId = (): WriteBoardId => {
  return {
    _type: "WriteBoardId",
    val: uuidv7(),
  };
};

export const createWriteBoardId = (
  id: string
): Result<WriteBoardId, ValidationError> => {
  if (!validateUUIDv7(id)) {
    return err(new ValidationError("不正な掲示板IDです"));
  }

  return ok({
    _type: "WriteBoardId",
    val: id,
  });
};

