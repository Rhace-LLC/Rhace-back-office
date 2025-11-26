"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { RootState } from "@/store/store";
import { useAuth } from "@/contexts/AuthContext";

import {
  getSubaccount,
  withdrawFromSubaccount,
  createSubaccount,
  getSubaccountBanks,
} from "@/api-services/subaccount.service";

import { setSubaccountDetails } from "@/store/subaccount.slice";
import { parseError } from "@/api-services/utils/parseError";
import { toast } from "sonner";
import { ContentHOC } from "@/components/nocontent";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLoading } from "@/contexts/LoadingContext";

export const WalletAndAccount = () => {
  const dispatch = useDispatch();
  const auth = useAuth();

  const subaccount = useSelector((state: RootState) => state.subaccount.data);

  const { setLoading, setLoadingText } = useLoading();

  const [loading, setLoadingState] = useState(false);
  const [error, setError] = useState("");

  // Withdrawal modal
  const [withdrawalModal, setWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");

  // Create Subaccount form state
  const [createData, setCreateData] = useState({
    account_number: "",
    bank_code: "",
    bank_name: "",
  });

  const [creating, setCreating] = useState(false);

  // BANK LIST
  const [banks, setBanks] = useState<any[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [banksError, setBanksError] = useState("");

  /* ============================================================
        FETCH SUBACCOUNT
  ============================================================ */
  const fetchSubAccount = async () => {
    try {
      setLoadingState(true);
      setError("");
      const res = await getSubaccount(auth.token);
      dispatch(setSubaccountDetails(res.data));
    } catch (err: any) {
      let message = parseError(err);
      setError(message);
      if (message !== "No subaccount found for this restaurant") {
        toast.error(message);
      }
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    if (!subaccount) fetchSubAccount();
  }, []);

  console.log("Sub account", subaccount);

  /* ============================================================
        FETCH BANKS
  ============================================================ */
  const fetchBanks = async () => {
    try {
      setBanksLoading(true);
      setBanksError("");

      const response = await getSubaccountBanks(auth.token);
      setBanks(response.data);
    } catch (err: any) {
      setBanksError(parseError(err));
    } finally {
      setBanksLoading(false);
    }
  };

  // Fetch banks ONLY when creating subaccount UI appears
  useEffect(() => {
    if (error === "No subaccount found for this restaurant") {
      fetchBanks();
    }
  }, [error]);

  /* ============================================================
        HANDLE WITHDRAW
  ============================================================ */
  const handleWithdraw = async () => {
    try {
      setLoading(true);
      setLoadingText("Initiating Withdrawal....");
      // 1. Fetch banks first
      if (banks.length == 0) {
        await fetchBanks();
      }

      // 2. Match bank name from subaccount settlement bank
      const matchedBank = banks.find(
        (b) =>
          b.name.toLowerCase() === subaccount?.settlement_bank.toLowerCase()
      );

      if (!matchedBank) {
        toast.error("Unable to detect bank code for withdrawal.");
        return;
      }

      // 3. Build payload with correct bank code
      const payload = {
        amount: withdrawalAmount,
        bank_code: matchedBank.code, // ✔ correct bank code
        reason: "Withdrawal",
      };

      // 4. Process withdrawal
      await withdrawFromSubaccount(auth.token, payload);

      toast.success("Withdrawal Request Submitted Successfully!");

      setWithdrawalAmount("");
      setWithdrawalModal(false);
    } catch (err: any) {
      toast.error(parseError(err));
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const isValidAmount =
    Number(withdrawalAmount) >= 1000 && withdrawalAmount.trim() !== "";

  /* ============================================================
        HANDLE CREATE SUBACCOUNT
  ============================================================ */
  const handleCreateSubaccount = async () => {
    try {
      setCreating(true);

      await createSubaccount(auth.token, createData);

      toast.success("Subaccount Created Successfully!");

      setCreateData({
        account_number: "",
        bank_code: "",
        bank_name: "",
      });

      fetchSubAccount();
      auth.setHasPayoutAccount(true);
    } catch (err: any) {
      toast.error(parseError(err));
    } finally {
      setCreating(false);
    }
  };

  const canSubmitCreate =
    createData.account_number.trim() !== "" &&
    createData.bank_code.trim() !== "" &&
    createData.bank_name.trim() !== "";

  /* ============================================================
        UI
  ============================================================ */
  return (
    <div className="p-4">
      {/* ============================================================
            CREATE SUBACCOUNT FLOW
      ============================================================ */}
      {error === "No subaccount found for this restaurant" && (
        <div className="space-y-4 rounded-lg border bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">Link Your Payout Account</h2>

          {/* ---- ACCOUNT NUMBER ---- */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Account Number</label>
            <Input
              value={createData.account_number}
              onChange={(e) =>
                setCreateData((prev) => ({
                  ...prev,
                  account_number: e.target.value,
                }))
              }
              placeholder="e.g. 0123456789"
            />
          </div>

          {/* ---- BANK DROPDOWN ---- */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Bank</label>

            {banksLoading && (
              <p className="text-sm text-gray-500">Loading banks...</p>
            )}

            {banksError && (
              <div className="space-y-2">
                <p className="text-sm text-red-500">{banksError}</p>
                <Button size="sm" onClick={fetchBanks}>
                  Retry
                </Button>
              </div>
            )}

            {!banksLoading && !banksError && (
              <Select
                onValueChange={(val) => {
                  const bank = banks.find((b) => b.code === val);
                  setCreateData((prev) => ({
                    ...prev,
                    bank_code: bank.code,
                    bank_name: bank.name,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>

                <SelectContent className="max-h-64 p-0">
                  <ScrollArea className="h-64">
                    <div className="p-1">
                      {banks.map((b) => (
                        <SelectItem key={b.id} value={b.code}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </div>
                  </ScrollArea>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* ---- SUBMIT ---- */}
          <Button
            className="mt-4 w-full"
            disabled={!canSubmitCreate || creating}
            onClick={handleCreateSubaccount}
          >
            {creating ? "Creating..." : "Create Subaccount"}
          </Button>
        </div>
      )}

      {/* ============================================================
            NORMAL SUBACCOUNT VIEW
      ============================================================ */}
      {error !== "No subaccount found for this restaurant" && (
        <ContentHOC
          loading={loading}
          error={!!error}
          noContent={!subaccount}
          loadingText="Fetching Sub Account Details..."
          noContentMessage="No Sub Account Found"
          noContentBtnText="Reload"
          noContentAction={fetchSubAccount}
          errMessage={error}
          actionFn={fetchSubAccount}
        >
          <div className="space-y-4 p-4">
            <h2 className="text-xl font-semibold">Wallet & Sub Account</h2>

            <div className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
              <p>
                <strong>Account Name:</strong> {subaccount?.account_name}
              </p>
              <p>
                <strong>Bank:</strong> {subaccount?.settlement_bank}
              </p>
              <p>
                <strong>Account Number:</strong> {subaccount?.account_number}
              </p>
              <p className="hidden">
                <strong>Available Balance:</strong> ₦
                {Number(subaccount?.available_balance || 0).toLocaleString()}
              </p>

              <Button
                variant="default"
                onClick={() => setWithdrawalModal(true)}
                className="mt-3 hidden"
              >
                Withdraw Funds
              </Button>
            </div>
          </div>

          {/* ============================================================
                WITHDRAWAL DIALOG
          ============================================================ */}
          <Dialog open={withdrawalModal} onOpenChange={setWithdrawalModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-3">
                <label className="text-sm font-medium">Amount (₦)</label>
                <Input
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="Enter amount (min ₦1000)"
                />
              </div>

              <DialogFooter>
                <Button
                  disabled={!isValidAmount}
                  onClick={handleWithdraw}
                  className="mt-4 w-full"
                >
                  Proceed
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </ContentHOC>
      )}
    </div>
  );
};
