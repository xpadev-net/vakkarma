export type BoardContext = {
  readonly boardId: string;
  readonly slug: string;
  readonly boardName: string;
  readonly localRule: string;
  readonly defaultAuthorName: string;
  readonly maxContentLength: number;
};
