"use client";

export default function ResetPassword() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md rounded-2xl bg-gray-50 p-8 shadow">
        <h2 className="mb-6 text-center text-2xl font-bold text-blue-600">
          Reset Password
        </h2>
        <form className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
