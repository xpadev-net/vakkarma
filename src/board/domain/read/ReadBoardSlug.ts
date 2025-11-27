import { err, ok } from "neverthrow";

import type { Result } from "neverthrow";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ReadBoardSlug = {
  readonly _type: "ReadBoardSlug";
  readonly val: string;
};

export const createReadBoardSlug = (
  slug: string
): Result<ReadBoardSlug, Error> => {
  if (!slugRegex.test(slug)) {
    return err(new Error("掲示板スラッグが不正です"));
  }

  return ok({
    _type: "ReadBoardSlug",
    val: slug,
  });
};

