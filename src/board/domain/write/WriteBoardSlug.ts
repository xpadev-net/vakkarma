import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { ValidationError } from "../../../shared/types/Error";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type WriteBoardSlug = {
  readonly _type: "WriteBoardSlug";
  readonly val: string;
};

export const createWriteBoardSlug = (
  slug: string,
): Result<WriteBoardSlug, ValidationError> => {
  if (!slugRegex.test(slug)) {
    return err(
      new ValidationError(
        "板スラッグは半角英数字とハイフンのみで構成してください",
      ),
    );
  }

  return ok({
    _type: "WriteBoardSlug",
    val: slug,
  });
};
