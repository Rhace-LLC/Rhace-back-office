import { Link } from "react-router-dom";

export default function Signup() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-blue-600 mb-6 text-center text-2xl font-bold">
          Create Account
        </h2>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="focus:ring-blue-500 w-full rounded-lg border p-3 focus:ring-2"
          />
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

          <label className="flex items-center text-sm text-gray-600">
            <input type="checkbox" className="mr-2" />I agree to the{" "}
            <Link
              to="/terms"
              className="text-blue-600 ml-1 hover:underline"
            >
              Terms & Conditions
            </Link>
          </label>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 w-full rounded-lg py-3 text-white"
          >
            Signup
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
