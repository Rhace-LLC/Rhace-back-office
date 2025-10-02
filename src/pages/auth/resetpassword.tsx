"use client";

export default function ResetPassword() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md rounded-2xl bg-gray-50 p-8 shadow">
        <h2 className="text-blue-600 mb-6 text-center text-2xl font-bold">
          Reset Password
        </h2>
        <form className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="focus:border-blue-500 w-full rounded-lg border px-4 py-2 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="focus:border-blue-500 w-full rounded-lg border px-4 py-2 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 w-full rounded-lg py-2 text-white"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
