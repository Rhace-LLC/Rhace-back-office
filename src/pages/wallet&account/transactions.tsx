import { useStableCallback } from "@/hooks/useStableCallback";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useAuth } from "@/contexts/AuthContext";
import formatPrice from "@/utils/formatPrice";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getTransactionHistory,
  Transaction,
} from "@/api-services/subaccountpayout.service";
import {
  setPagination,
  updateTransactionData,
} from "@/store/transaction.slice";
import { Pagination } from "@/components/pagination";

export const TransactionsPage = () => {
  const auth = useAuth();
  const dispatch = useDispatch();

  const dataFromStore = useSelector((state: RootState) => state.transactions);
  const allTranx = dataFromStore.data;

  const [page, setPage] = useState(1);
  const pageSize = 50;

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const transactions = allTranx[String(page)] ?? [];

  // Fetch transactions
  const fetchTransactions = useStableCallback(async () => {
    setLoading(true);
    try {
      const res = await getTransactionHistory(auth.token, {
        page,
        limit: pageSize,
      });

      dispatch(
        updateTransactionData({
          key: String(page),
          data: res.data.transactions,
        })
      );
      dispatch(setPagination(res.data.pagination));

    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  });

  useEffect(() => {
    const existing = allTranx[String(page)];
    if (!existing) fetchTransactions();
  }, [page, allTranx, fetchTransactions]);

  // Pages come from the API's `page_count`. (Previously the fetch set this to
  // `pagination.total` — the ITEM count — so the pager showed far too many
  // pages until the store effect overwrote it.)
  const totalPages = Math.max(1, dataFromStore.pagination?.page_count ?? 1);

  return (
    <div className="space-y-6">
      {/* TABLE */}
      <div className="rounded-md border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[160px]">Reference</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading &&
              // Skeleton rows under the real header (same loading pattern as
              // every other page).
              Array.from({ length: 5 }).map((_, r) => (
                <TableRow key={`skeleton-${r}`} aria-busy="true">
                  {Array.from({ length: 6 }).map((_, c) => (
                    <TableCell key={c} className="py-4">
                      <Skeleton className="h-4 w-full max-w-[140px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading &&
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.reference}</TableCell>
                  <TableCell>{tx.amount.formatted}</TableCell>
                  <TableCell className="capitalize">{tx.status}</TableCell>
                  <TableCell>{tx.customer.email}</TableCell>
                  <TableCell>{tx.transaction_date}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelected(tx)}
                        >
                          View
                        </Button>
                      </DialogTrigger>

                      {/* Dialog Content */}
                      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Transaction Details</DialogTitle>
                        </DialogHeader>

                        {selected && (
                          <div className="space-y-3 text-sm">
                            <Detail
                              label="Reference"
                              value={selected.reference}
                            />
                            <Detail label="Status" value={selected.status} />
                            <Detail
                              label="Amount"
                              value={selected.amount.formatted}
                            />
                            <Detail
                              label="Customer Email"
                              value={selected.customer.email}
                            />
                            <Detail label="Paid At" value={selected.paid_at} />
                            <Detail label="Channel" value={selected.channel} />
                            <Detail
                              label="Order ID"
                              value={selected.metadata.order_id}
                            />
                            <Detail
                              label="Restaurant"
                              value={selected.metadata.restaurant_name}
                            />
                            <Detail
                              label="Fees"
                              value={formatPrice(selected.fees)}
                            />
                            <Detail
                              label="Card Type"
                              value={selected.authorization.card_type}
                            />
                            <Detail
                              label="Bank"
                              value={selected.authorization.bank}
                            />
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}

            {!loading && transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION (hidden when everything fits on one page) */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-4">
          <Pagination
            currentPage={page}
            onPageChange={setPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
};

// =============== SMALL DETAIL COMPONENT ===============
const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4">
    <span className="font-medium text-ink-secondary">{label}</span>
    <span className="text-ink">{value}</span>
  </div>
);
