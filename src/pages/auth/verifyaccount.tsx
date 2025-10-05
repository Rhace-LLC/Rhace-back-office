"use client";

export default function OtpVerification() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md rounded-2xl bg-gray-50 p-8 shadow">
        <h2 className="mb-6 text-center text-2xl font-bold text-blue-600">
          OTP Verification
        </h2>
        <p className="mb-4 text-center text-gray-600">
          Enter the 6-digit code sent to your email.
        </p>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            maxLength={6}
            className="w-full rounded-lg border px-4 py-2 text-center tracking-widest focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
