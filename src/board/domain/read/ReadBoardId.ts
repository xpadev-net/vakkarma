import { err, ok } from "neverthrow";

import type { Result } from "neverthrow";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ReadBoardId = {
  readonly _type: "ReadBoardId";
  readonly val: string;
};

export const createReadBoardId = (id: string): Result<ReadBoardId, Error> => {
  if (!uuidRegex.test(id)) {
    return err(new Error("不正な掲示板IDです"));
  }

  return ok({
    _type: "ReadBoardId",
    val: id,
  });
};

