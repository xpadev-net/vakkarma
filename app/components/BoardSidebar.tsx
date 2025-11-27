import type { BoardLink } from "./boardTypes";
import type { FunctionalComponent } from "preact";


type BoardSidebarProps = {
  boards: BoardLink[];
  activeSlug: string;
};

export const BoardSidebar: FunctionalComponent<BoardSidebarProps> = ({
  boards,
  activeSlug,
}) => {
  return (
    <aside className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">掲示板一覧</h2>
      <ul className="flex flex-col gap-2">
        {boards.map((board) => {
          const isActive = board.slug === activeSlug;
          return (
            <li key={board.slug}>
              <a
                href={`/boards/${board.slug}`}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {board.name}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

