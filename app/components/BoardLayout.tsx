import type { Child, FC } from "hono/jsx";
import { BoardSidebar } from "./BoardSidebar";
import type { BoardLink } from "./boardTypes";

type BoardLayoutProps = {
  boards: BoardLink[];
  activeSlug: string;
  children?: Child;
};

export const BoardLayout: FC<BoardLayoutProps> = ({
  boards,
  activeSlug,
  children,
}) => {
  return (
    <div className="container mx-auto flex-grow py-8 px-4">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-64 w-full">
          <BoardSidebar boards={boards} activeSlug={activeSlug} />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};
