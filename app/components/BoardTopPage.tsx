import type { FC } from "hono/jsx";
import type { BoardContext } from "../../src/board/types/BoardContext";
import { formatReadAuthorName } from "../../src/conversation/domain/read/ReadAuthorName";
import type { ReadResponse } from "../../src/conversation/domain/read/ReadResponse";
import type { ReadThread } from "../../src/conversation/domain/read/ReadThread";
import { isSage } from "../../src/conversation/domain/write/WriteMail";
import { formatDate } from "../../src/shared/utils/formatDate";
import FormEnhance from "../islands/FormEnhance";
import { BoardLayout } from "./BoardLayout";
import type { BoardLink } from "./boardTypes";
import { ResponseContentComponent } from "./ResponseContent";

type ThreadWithResponses = {
  thread: ReadThread;
  responses: ReadResponse[];
};

type BoardTopPageProps = {
  boardContext: BoardContext;
  boards: BoardLink[];
  threadTop30: ReadThread[];
  responsesTop10: ThreadWithResponses[];
  acceptLanguage?: string;
};

export const BoardTopPage: FC<BoardTopPageProps> = ({
  boardContext,
  boards,
  threadTop30,
  responsesTop10,
  acceptLanguage,
}) => {
  const basePath = `/boards/${boardContext.slug}`;

  return (
    <BoardLayout boards={boards} activeSlug={boardContext.slug}>
      <main className="flex flex-col gap-8">
        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {boardContext.boardName}
            </h2>
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
              {boardContext.localRule}
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              人気スレッド
            </h3>
          </div>
          <ul className="flex flex-wrap gap-4">
            {threadTop30.map((thread, index) => (
              <li key={thread.id.val} className="flex-none max-w-md">
                <a
                  className="text-purple-600 underline whitespace-normal break-words"
                  href={
                    index < 10
                      ? `#thread-${thread.id.val}`
                      : `${basePath}/threads/${thread.id.val}/l50`
                  }
                >
                  {index + 1}: {thread.title.val} ({thread.countResponse})
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <a
              href={`${basePath}/subback.html`}
              className="text-blue-600 hover:underline"
            >
              全スレッド一覧
            </a>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          {responsesTop10.map((threadResp, threadIndex) => (
            <article
              id={`thread-${threadResp.thread.id.val}`}
              key={threadResp.thread.id.val}
              className="bg-white rounded-lg shadow-md p-6 pb-4"
            >
              <h3 className="text-purple-600 font-bold text-xl whitespace-normal break-words">
                【{threadIndex + 1}:{threadResp.thread.countResponse}】{" "}
                {threadResp.thread.title.val}
              </h3>
              <ul className="flex flex-col gap-2 mt-2">
                {threadResp.responses.map((resp) => (
                  <li
                    key={resp.responseId.val}
                    id={`${resp.threadId.val}-${resp.responseNumber.val}`}
                    className="bg-gray-50 p-4 rounded-md"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold">
                        {resp.responseNumber.val}
                      </span>
                      <span
                        className={`text-gray-700 ${
                          isSage(resp.mail) ? "text-violet-600" : ""
                        }`}
                      >
                        名前: {formatReadAuthorName(resp.authorName)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {formatDate(resp.postedAt.val, {
                          acceptLanguage,
                        })}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ID: {resp.hashId.val}
                      </span>
                    </div>
                    <div className="text-gray-800 max-h-80 overflow-y-auto whitespace-pre-wrap">
                      <ResponseContentComponent
                        threadId={resp.threadId}
                        responseContent={resp.responseContent}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="m-4 p-2 rounded-md">
                <h3 className="text-xl font-semibold mb-4">返信する</h3>
                <form
                  method="post"
                  action={`${basePath}/threads/${threadResp.thread.id.val}/responses`}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2 md:w-1/2">
                      名前:
                      <input
                        type="text"
                        name="name"
                        className="border border-gray-400 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                      />
                    </label>
                    <label className="block text-gray-700 text-sm font-bold mb-2 md:w-1/2">
                      メールアドレス:
                      <input
                        name="mail"
                        className="border border-gray-400 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      本文:
                      <textarea
                        name="content"
                        required
                        className="border border-gray-400 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline h-32"
                      ></textarea>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    書き込む
                  </button>
                  <FormEnhance />
                </form>
                <div className="flex gap-4 mt-2">
                  <a
                    href={`${basePath}/threads/${threadResp.thread.id.val}`}
                    className="text-blue-600 hover:underline"
                  >
                    全部読む
                  </a>
                  <a
                    href={`${basePath}/threads/${threadResp.thread.id.val}/l50`}
                    className="text-blue-600 hover:underline"
                  >
                    最新50件
                  </a>
                  <a
                    href={`${basePath}/threads/${threadResp.thread.id.val}/1-100`}
                    className="text-blue-600 hover:underline"
                  >
                    1-100
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section
          className="bg-white rounded-lg shadow-md p-6"
          id="new-thread-form"
        >
          <h2 className="text-2xl font-semibold mb-4">新規スレッド作成</h2>
          <form
            method="post"
            action={`${basePath}/threads`}
            className="flex flex-col gap-2"
          >
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                スレッドタイトル:
                <input
                  type="text"
                  name="title"
                  required
                  className="border border-gray-400 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                />
              </label>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 md:w-1/2">
                名前:
                <input
                  type="text"
                  name="name"
                  className="border border-gray-400 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                />
              </label>
              <label className="block text-gray-700 text-sm font-bold mb-2 md:w-1/2">
                メールアドレス:
                <input
                  name="mail"
                  className="border border-gray-400 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                />
              </label>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                本文:
                <textarea
                  name="content"
                  required
                  className="border border-gray-400 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline h-32"
                ></textarea>
              </label>
            </div>
            <button
              type="submit"
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              新規スレッド作成
            </button>
            <FormEnhance />
          </form>
        </section>

        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
          <a
            href="#new-thread-form"
            className="bg-purple-500 hover:bg-purple-700 text-white p-4 md:p-6 rounded-full shadow-lg focus:outline-none transition text-2xl md:text-4xl lg:text-3xl"
          >
            ＋
          </a>
        </div>
      </main>
    </BoardLayout>
  );
};
