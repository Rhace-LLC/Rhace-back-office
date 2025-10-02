import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-blue-600 mb-6 text-center text-2xl font-bold">
          Login
        </h2>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="focus:ring-blue-500 w-full rounded-lg border p-3 focus:ring-2"
          />
          <input
            type="password"
            placeholder="Password"
            className="focus:ring-blue-500 w-full rounded-lg border p-3 focus:ring-2"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 w-full rounded-lg py-3 text-white"
          >
            Login
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <Link to="/forgot-password" className="hover:text-blue-600">
            Forgot Password?
          </Link>
          <Link to="/signup" className="hover:text-blue-600">
            Don’t have an account? Signup
          </Link>
        </div>
      </div>
    </div>
  );
}
