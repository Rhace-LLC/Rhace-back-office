"use client";

export default function ForgotPassword() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md rounded-2xl bg-gray-50 p-8 shadow">
        <h2 className="mb-6 text-center text-2xl font-bold text-blue-600">
          Forgot Password
        </h2>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
