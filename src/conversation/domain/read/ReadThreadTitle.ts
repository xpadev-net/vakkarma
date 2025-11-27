import type { Result } from "neverthrow";
import { ok } from "neverthrow";

export type ReadThreadTitle = {
  readonly _type: "ReadThreadTitle";
  readonly val: string;
};

export const createReadThreadTitle = (
  value: string,
): Result<ReadThreadTitle, Error> => {
  return ok({
    _type: "ReadThreadTitle",
    val: value,
  });
};
