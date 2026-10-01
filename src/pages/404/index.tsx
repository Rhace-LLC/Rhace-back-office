import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-inset px-6">
      {/* Icon */}
      <div className="bg-royalblue-100 mb-6 rounded-full p-6">
        <SearchX className="text-royalblue-600" size={64} />
      </div>

      {/* Text */}
      <h1 className="mb-2 text-4xl font-bold text-ink">404</h1>
      <p className="mb-6 text-center text-lg text-ink-secondary">
        Oops! The page you’re looking for doesn’t exist.
      </p>

      {/* Button */}
      <Link
        to="/"
        className="bg-royalblue-600 hover:bg-royalblue-700 rounded-2xl px-6 py-3 font-medium text-white shadow-md transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}
