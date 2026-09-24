import {
  createSubaccount,
  getSubaccount,
  getSubaccountBalance,
  getSubaccountBanks,
  getSubaccountWithdrawals,
} from "@/api-services/subaccount.service";
import {
  createApiProbe,
  type ServiceAggregatorDefinition,
} from "../aggregator.types";

// Skipped on purpose: withdrawFromSubaccount moves real money.

export const subaccountAggregator: ServiceAggregatorDefinition = {
  id: "subaccount",
  name: "Subaccount",
  serviceFile: "subaccount.service.ts",
  description:
    "Subaccount reads plus an opt-in write: a subaccount creation attempt with test bank details.",
  hasWriteProbes: true,
  getProbes: ({ token }) => {
    if (!token) return [];
    return [
      createApiProbe(
        "subaccount-details",
        "Subaccount details",
        "GET",
        "/subaccount/",
        () => getSubaccount(token)
      ),
      createApiProbe(
        "subaccount-balance",
        "Subaccount balance",
        "GET",
        "/subaccount/balance/",
        () => getSubaccountBalance(token)
      ),
      createApiProbe(
        "subaccount-banks",
        "Supported banks",
        "GET",
        "/subaccount/banks/",
        () => getSubaccountBanks(token)
      ),
      createApiProbe(
        "subaccount-withdrawals",
        "Withdrawal history",
        "GET",
        "/subaccount/withdrawals/",
        () => getSubaccountWithdrawals(token)
      ),
      createApiProbe(
        "subaccount-create",
        "Create subaccount (test)",
        "POST",
        "/subaccount/create/",
        () =>
          createSubaccount(
            token,
            {
              account_number: "0000000000",
              bank_code: "058",
              bank_name: "[API-TEST] probe",
            }
          ),
        true
      ),
    ];
  },
};
