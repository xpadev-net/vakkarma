import { useNavigate } from "@remix-run/react";
import ErrorRedirect from "../islands/ErrorRedirect"; // Import the island

export const ErrorMessage = ({ error }: { error: Error }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-red-500 text-lg font-bold">エラーが発生しました</p>
      <p className="text-gray-700">{error.message}</p>
      <button
        type="button"
        className="text-blue-500 hover:underline mt-4"
        onClick={handleBackClick}
      >
        戻る
      </button>
      {/* Add the ErrorRedirect island */}
      <ErrorRedirect />
    </div>
  );
};
