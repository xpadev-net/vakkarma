import type { Result } from "neverthrow";
import { ok } from "neverthrow";

export type ReadLocalRule = {
  readonly _type: "ReadLocalRule";
  readonly val: string;
};

export const createReadLocalRule = (
  localRule: string,
): Result<ReadLocalRule, Error> => {
  return ok({
    _type: "ReadLocalRule",
    val: localRule,
  });
};
