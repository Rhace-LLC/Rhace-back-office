"use client";

export default function ForgotPassword() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md rounded-2xl bg-gray-50 p-8 shadow">
        <h2 className="text-blue-600 mb-6 text-center text-2xl font-bold">
          Forgot Password
        </h2>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="focus:border-blue-500 w-full rounded-lg border px-4 py-2 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 w-full rounded-lg py-2 text-white"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
