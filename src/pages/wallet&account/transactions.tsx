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
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const transactions = allTranx[String(page)] ?? [];

  // Fetch transactions
  const fetchTransactions = async () => {
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

      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const existing = allTranx[String(page)];
    if (!existing) fetchTransactions();
  }, [page]);

  useEffect(() => {
    setTotal(dataFromStore.pagination.page_count);
  }, [dataFromStore]);

  return (
    <div className="space-y-6">
      {/* TABLE */}
      <div className="rounded-xl border bg-white">
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
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            )}

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

      {/* PAGINATION */}
      <div className="flex justify-end gap-4">
        <Pagination
          currentPage={page}
          onPageChange={setPage}
          totalPages={total}
        />
      </div>
    </div>
  );
};

// =============== SMALL DETAIL COMPONENT ===============
const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4">
    <span className="font-medium text-gray-600">{label}</span>
    <span className="text-gray-900">{value}</span>
  </div>
);
