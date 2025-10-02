"use client";

export default function OtpVerification() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md rounded-2xl bg-gray-50 p-8 shadow">
        <h2 className="text-blue-600 mb-6 text-center text-2xl font-bold">
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
            className="focus:border-blue-500 w-full rounded-lg border px-4 py-2 text-center tracking-widest focus:outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 w-full rounded-lg py-2 text-white"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
