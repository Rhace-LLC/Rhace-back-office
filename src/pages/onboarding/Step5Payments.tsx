"use client";
import { useCallback, useEffect, useState } from "react";
import { Check, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  createSubaccount,
  getSubaccountBanks,
  getSubaccount,
} from "@/api-services/subaccount.service";
import { parseError } from "@/api-services/utils/parseError";
import { StepHeader } from "./ui";
import { obField } from "./tokens";

interface BankOption {
  code: string;
  name: string;
}

export function Step5Payments({
  restaurantName,
  onExit,
  onComplete,
}: {
  restaurantName?: string;
  onExit: () => void;
  onComplete: () => void;
}) {
  const auth = useAuth();

  // Bank details
  const [accountName, setAccountName] = useState(restaurantName ?? "");
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [banksError, setBanksError] = useState("");

  const loadBanks = useCallback(async () => {
    setBanksLoading(true);
    setBanksError("");
    try {
      const response = await getSubaccountBanks(auth.token);
      setBanks(response.data ?? []);
    } catch (error) {
      setBanksError(parseError(error) || "Could not load banks.");
    } finally {
      setBanksLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

  // If the restaurant already has a settlement account, treat it as verified.
  useEffect(() => {
    const checkExisting = async () => {
      try {
        const res = await getSubaccount(auth.token);
        const existing = res?.data;
        if (existing) {
          setAccountName(existing.account_name || restaurantName || "");
          setBankName(existing.settlement_bank || "");
          setAccountNumber(existing.account_number || "");
          setVerified(true);
        }
      } catch {
        // No subaccount yet — the form below will create one.
      }
    };
    checkExisting();
  }, [auth, restaurantName]);

  const handleVerifyAccount = async () => {
    if (!accountName.trim() || !accountNumber.trim() || !bankCode) return;
    setVerifying(true);
    try {
      await createSubaccount(auth.token, {
        account_number: accountNumber,
        bank_code: bankCode,
        bank_name: bankName,
      });
      auth.setHasPayoutAccount(true);
      toast.success("Account verified successfully!");
      setVerified(true);
    } catch (error) {
      toast.error(parseError(error) || "Could not verify this account.");
    } finally {
      setVerifying(false);
    }
  };

  const masked = `•••• ${accountNumber.slice(-4) || "0000"}`;

  return (
    <>
      <StepHeader
        step="05"
        title="Where should we send your money?"
        subtitle="Connect your bank account to receive payments from your restaurant."
      />

      {!verified ? (
        <div className="space-y-5">
          {/* Account name + bank */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="ob-acct-name"
                className="mb-1.5 block text-sm font-medium leading-5 text-ink-secondary"
              >
                Account name
              </label>
              <input
                id="ob-acct-name"
                className={obField}
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Business account name"
              />
            </div>
            <div>
              <label
                htmlFor="ob-bank"
                className="mb-1.5 block text-sm font-medium leading-5 text-ink-secondary"
              >
                Bank
              </label>
              <select
                id="ob-bank"
                className={obField}
                value={bankCode}
                onChange={(e) => {
                  const code = e.target.value;
                  setBankCode(code);
                  setBankName(banks.find((b) => b.code === code)?.name ?? "");
                }}
              >
                {banksLoading ? (
                  <option value="">Loading banks…</option>
                ) : (
                  <>
                    <option value="">Select your bank</option>
                    {banks.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {banksError && (
                <p className="mt-1 flex items-center justify-between gap-2 text-xs leading-[17px] text-destructive">
                  <span>{banksError}</span>
                  <button
                    type="button"
                    onClick={loadBanks}
                    className="font-medium underline underline-offset-2"
                  >
                    Retry
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Account number + Verify — button sits right where typing ends */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:flex-1">
              <label
                htmlFor="ob-acct-no"
                className="mb-1.5 block text-sm font-medium leading-5 text-ink-secondary"
              >
                Account number
              </label>
              <input
                id="ob-acct-no"
                className={obField}
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(
                    e.target.value.replace(/[^\d]/g, "").slice(0, 10)
                  )
                }
                placeholder="0000000000"
                inputMode="numeric"
              />
            </div>
            <button
              type="button"
              onClick={handleVerifyAccount}
              disabled={
                !accountName.trim() ||
                !accountNumber.trim() ||
                !bankCode ||
                verifying
              }
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-ink px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-ink-secondary focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:shrink-0"
            >
              {verifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {verifying ? "Verifying account…" : "Verify account"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-700">
              Account verified
            </p>
          </div>
          <div className="mt-3 rounded-[12px] bg-surface px-4 py-3 ring-1 ring-line">
            <p className="text-sm font-semibold text-ink">{accountName}</p>
            <p className="text-xs text-ink-muted">
              {bankName} · {masked}
            </p>
          </div>
        </div>
      )}

      {verified && (
        <>
          <p className="mt-4 rounded-[12px] border border-line bg-cardfill px-4 py-3 text-xs leading-[17px] text-ink-subtle">
            Your bank details are encrypted and used only for payment
            settlement.
          </p>
          <div className="mt-8 space-y-2 border-t border-line-subtle pt-6">
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex h-12 w-full items-center justify-center rounded-[8px] bg-ink px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-ink-secondary focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none"
            >
              Finish Setup
            </button>
            <button
              type="button"
              onClick={onExit}
              className="inline-flex h-12 w-full items-center justify-center rounded-[8px] px-5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-line-subtle hover:text-ink"
            >
              Back
            </button>
          </div>
        </>
      )}
    </>
  );
}
