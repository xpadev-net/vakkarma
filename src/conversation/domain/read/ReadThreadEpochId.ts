import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { ValidationError } from "../../../shared/types/Error";

export type ReadThreadEpochId = {
  readonly _type: "ReadThreadEpochId";
  readonly val: number;
};

export const createReadThreadEpochId = (
  value: string,
): Result<ReadThreadEpochId, Error> => {
  // BIGINTを扱うため、数値に変換
  const epochId = Number(value);
  if (Number.isNaN(epochId)) {
    return err(new ValidationError("ThreadEpochIdは数値である必要があります"));
  }
  return ok({
    _type: "ReadThreadEpochId",
    val: epochId,
  });
};
