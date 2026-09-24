import {
  createSubAccount,
  getSubAccount,
  getSubAccountBalance,
  getSubAccountBanks,
  getSubAccountWithdrawals,
  getTransactionHistory,
} from "@/api-services/subaccountpayout.service";
import {
  createApiProbe,
  type ServiceAggregatorDefinition,
} from "../aggregator.types";

// Skipped on purpose: withdrawFromSubAccount moves real money and
// updateSubAccount overwrites the live payout destination.

export const subaccountPayoutAggregator: ServiceAggregatorDefinition = {
  id: "subaccount-payout",
  name: "Subaccount Payouts",
  serviceFile: "subaccountpayout.service.ts",
  description:
    "Payout subaccount reads plus an opt-in write: a subaccount creation attempt with test bank details.",
  hasWriteProbes: true,
  getProbes: ({ token }) => {
    if (!token) return [];
    return [
      createApiProbe(
        "payout-subaccount",
        "Subaccount details",
        "GET",
        "/subaccount/",
        () => getSubAccount(token)
      ),
      createApiProbe(
        "payout-balance",
        "Subaccount balance",
        "GET",
        "/subaccount/balance/",
        () => getSubAccountBalance(token)
      ),
      createApiProbe(
        "payout-banks",
        "Supported banks",
        "GET",
        "/subaccount/banks/",
        () => getSubAccountBanks(token)
      ),
      createApiProbe(
        "payout-transactions",
        "Transaction history",
        "GET",
        "/subaccount/transaction/histories/",
        () => getTransactionHistory(token)
      ),
      createApiProbe(
        "payout-withdrawals",
        "Withdrawal history",
        "GET",
        "/subaccount/withdrawals/",
        () => getSubAccountWithdrawals(token)
      ),
      createApiProbe(
        "payout-create",
        "Create subaccount (test)",
        "POST",
        "/subaccount/create/",
        () =>
          createSubAccount(
            {
              account_number: "0000000000",
              bank_code: "058",
              bank_name: "[API-TEST] probe",
            },
            token
          ),
        true
      ),
    ];
  },
};
