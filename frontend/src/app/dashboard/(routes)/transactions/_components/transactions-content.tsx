"use client";

import { IconPlus, IconTableImport } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { getAllTransactionsAction } from "@/actions/transactions/actions";
import type { Transaction, TransactionFilters } from "@/types/transaction";
import { AddTransactionSheet } from "./add-transaction-sheet";
import { BulkImportSheet } from "./bulk-import-sheet";
import { TransactionsDataTable } from "./transactions-data-table";

export function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Sheets
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showImportSheet, setShowImportSheet] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const filters: TransactionFilters = {};

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllTransactionsAction(filters, {
        pageNumber,
        pageSize,
      });
      setTransactions(result.transactions ?? []);
      setTotalPages(result.totalPages ?? 1);
      setTotal(result.total ?? 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transactions",
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <main className="min-h-screen bg-[oklch(0.06_0.01_145)] px-6 py-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">All Transactions</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage and track all your financial transactions
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={() => setShowImportSheet(true)}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:border-white/25 hover:text-white transition-all"
            >
              <IconTableImport size={16} />
              Bulk Import
            </button>
            <button
              type="button"
              onClick={() => setShowAddSheet(true)}
              className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
            >
              <IconPlus size={16} />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Data Table */}
        <TransactionsDataTable
          transactions={transactions}
          loading={loading}
          error={error}
          total={total}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={(page: number) => setPageNumber(page)}
          onRefresh={fetchData}
          onEdit={(tx: Transaction) => setEditingTx(tx)}
        />
      </div>

      {/* Sheets */}
      <AddTransactionSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        onSaved={fetchData}
      />
      <AddTransactionSheet
        open={!!editingTx}
        onOpenChange={(open: boolean) => {
          if (!open) setEditingTx(null);
        }}
        onSaved={fetchData}
        initial={editingTx}
      />
      <BulkImportSheet
        open={showImportSheet}
        onOpenChange={setShowImportSheet}
        onSaved={fetchData}
      />
    </main>
  );
}
