import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import type { WritePostedAt } from "./WritePostedAt";
import type { WriteThreadEpochId } from "./WriteThreadEpochId";
import { generateWriteThreadEpochId } from "./WriteThreadEpochId";
import type { WriteThreadId } from "./WriteThreadId";
import { generateWriteThreadId } from "./WriteThreadId";
import type { WriteThreadTitle } from "./WriteThreadTitle";

export type WriteThread = {
  readonly _type: "WriteThread";
  readonly id: WriteThreadId;
  readonly title: WriteThreadTitle;
  readonly postedAt: WritePostedAt;
  readonly epochId: WriteThreadEpochId;
  readonly boardId: string;
  // 返信時、updatedAtも更新される
  // このときの動作は専用のリポジトリを実装してしまうことにする
  // (少しお行儀が悪いかも)
  readonly updatedAt: WritePostedAt;
};

// スレッドのファクトリ関数
// 外部からpostedAtを受け取るように変更。レスの方と一貫性を取るため。ユースケースで生成する
export const createWriteThread = ({
  title,
  postedAt,
  boardId,
}: {
  title: WriteThreadTitle;
  postedAt: WritePostedAt;
  boardId: string;
}): Result<WriteThread, Error> => {
  if (!boardId) {
    return err(new Error("板IDが不正です"));
  }

  const id = generateWriteThreadId();

  const threadEpochIdResult = generateWriteThreadEpochId(postedAt);
  if (threadEpochIdResult.isErr()) {
    return err(threadEpochIdResult.error);
  }
  // 同じ値を利用
  const updatedAt = postedAt;

  return ok({
    _type: "WriteThread",
    id,
    title,
    postedAt,
    updatedAt,
    epochId: threadEpochIdResult.value,
    boardId,
  });
};
