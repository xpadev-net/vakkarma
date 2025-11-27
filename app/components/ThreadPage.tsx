
import { formatReadAuthorName } from "../../src/conversation/domain/read/ReadAuthorName";
import { isSage } from "../../src/conversation/domain/write/WriteMail";
import { formatDate } from "../../src/shared/utils/formatDate";
import FormEnhance from "../islands/FormEnhance";

import { BoardLayout } from "./BoardLayout";
import { ResponseContentComponent } from "./ResponseContent";

import type { BoardLink } from "./boardTypes";
import type { BoardContext } from "../../src/board/types/BoardContext";
import type { ReadResponse } from "../../src/conversation/domain/read/ReadResponse";
import type { ReadThreadWithResponses } from "../../src/conversation/domain/read/ReadThreadWithResponses";
import type { FunctionalComponent } from "preact";

type ThreadPageProps = {
  boardContext: BoardContext;
  boards: BoardLink[];
  thread: ReadThreadWithResponses["thread"];
  responses: ReadResponse[];
  latestResponseNumber: number;
  acceptLanguage?: string;
};

export const ThreadPage: FunctionalComponent<ThreadPageProps> = ({
  boardContext,
  boards,
  thread,
  responses,
  latestResponseNumber,
  acceptLanguage,
}) => {
  const basePath = `/boards/${boardContext.slug}`;
  const threadId = thread.threadId.val;

  return (
    <BoardLayout boards={boards} activeSlug={boardContext.slug}>
      <main className="flex flex-col gap-6">
        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h3 className="text-purple-600 font-bold text-xl mb-2 whitespace-normal break-words">
              {thread.threadTitle.val} ({thread.responseCount})
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            {responses.map((resp) => (
              <div
                key={resp.responseNumber.val}
                id={`${resp.threadId.val}-${resp.responseNumber.val}`}
                className="bg-gray-50 p-4 rounded-md"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-bold">{resp.responseNumber.val}</span>
                  <span
                    className={`text-gray-700 ${
                      isSage(resp.mail) ? "text-violet-600" : ""
                    }`}
                  >
                    {formatReadAuthorName(resp.authorName)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {formatDate(resp.postedAt.val, { acceptLanguage })}
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
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2">
            <a
              href={`${basePath}/threads/${threadId}`}
              className="text-blue-600 hover:underline"
            >
              全部読む
            </a>
            <a
              href={`${basePath}/threads/${threadId}/l50`}
              className="text-blue-600 hover:underline"
            >
              最新50件
            </a>
            <a
              href={`${basePath}/threads/${threadId}/1-100`}
              className="text-blue-600 hover:underline"
            >
              1-100
            </a>
            <a
              href={`${basePath}/threads/${threadId}/${latestResponseNumber}-`}
              className="text-blue-600 hover:underline"
            >
              新着レスの表示
            </a>
          </div>
        </section>

        <section
          id="response-form"
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-2xl font-semibold mb-4">返信する</h2>
          <form
            method="post"
            action={`${basePath}/threads/${threadId}/responses`}
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
        </section>

        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
          <a
            href="#response-form"
            className="bg-purple-500 hover:bg-purple-700 text-white p-4 md:p-6 rounded-full shadow-lg focus:outline-none transition text-2xl md:text-4xl lg:text-3xl"
          >
            ↓
          </a>
        </div>
      </main>
    </BoardLayout>
  );
};

