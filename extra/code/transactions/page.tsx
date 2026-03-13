/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Loader2Icon, UploadIcon } from "lucide-react";

type Transaction = {
  id: string;
  userId: string;
  type: "INCOME" | "EXPENSE";
  title: string;
  amount: number;
  category: string;
  receiptUrl?: string | null;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  nextRecurringDate?: string | null;
  lastProcessed?: string | null;
  isRecurring: boolean;
  description?: string | null;
  date: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  paymentMethod:
    | "CARD"
    | "BANK_TRANSFER"
    | "MOBILE_PAYMENT"
    | "AUTO_DEBIT"
    | "CASH"
    | "OTHER";
  createdAt: string;
  updatedAt: string;
};

type PaginationMeta = {
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  totalPages: number;
  skip: number;
};

type TransactionsResponse = {
  message: string;
  transactions: Transaction[];
  pagination: PaginationMeta;
};

const backendURL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000";

function formatCurrency(amountInCents: number) {
  const dollars = amountInCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(dollars);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">(
    "ALL",
  );
  const [frequencyFilter, setFrequencyFilter] = useState<
    "ALL" | "RECURRING" | "NON_RECURRING"
  >("ALL");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    for (const tx of transactions) {
      unique.add(tx.category);
    }
    return Array.from(unique);
  }, [transactions]);

  useEffect(() => {
    async function loadTransactions() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("pageSize", String(pageSize));
        params.set("pageNumber", String(page));

        if (search.trim()) {
          params.set("keyword", search.trim());
        } else if (categoryFilter !== "all") {
          params.set("keyword", categoryFilter);
        }

        if (typeFilter !== "ALL") {
          params.set("type", typeFilter);
        }

        if (frequencyFilter !== "ALL") {
          params.set("recurringStatus", frequencyFilter);
        }

        const res = await fetch(
          `${backendURL}/api/transaction/all?${params.toString()}`,
          {
            credentials: "include",
          },
        );

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as
            | { message?: string }
            | null;
          throw new Error(body?.message || "Failed to load transactions");
        }

        const data = (await res.json()) as TransactionsResponse;
        setTransactions(data.transactions ?? []);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    void loadTransactions();
  }, [page, pageSize, search, categoryFilter, typeFilter, frequencyFilter]);

  const filteredByCategory =
    categoryFilter === "all"
      ? transactions
      : transactions.filter((tx) => tx.category === categoryFilter);

  const isEmpty = !loading && filteredByCategory.length === 0;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            All Transactions
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Review every income and expense in one place. Search, filter, and
            manage recurring transactions with a few clicks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 border-dashed"
            type="button"
          >
            <UploadIcon className="size-4" />
            Bulk Import
          </Button>
          <Button type="button" className="gap-2">
            + Add Transaction
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border bg-card/70 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-1/2">
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              aria-label="Search transactions"
            />
          </div>

          <div className="flex w-full flex-wrap justify-end gap-2 sm:w-1/2">
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setPage(1);
                setCategoryFilter(value);
              }}
            >
              <SelectTrigger size="sm" className="min-w-32">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Category: All</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(value: "ALL" | "INCOME" | "EXPENSE") => {
                setPage(1);
                setTypeFilter(value);
              }}
            >
              <SelectTrigger size="sm" className="min-w-28">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={frequencyFilter}
              onValueChange={(
                value: "ALL" | "RECURRING" | "NON_RECURRING",
              ) => {
                setPage(1);
                setFrequencyFilter(value);
              }}
            >
              <SelectTrigger size="sm" className="min-w-32">
                <SelectValue placeholder="Frequently" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Frequently: All</SelectItem>
                <SelectItem value="RECURRING">Recurring</SelectItem>
                <SelectItem value="NON_RECURRING">One-time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-background/40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Created</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Transaction Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2Icon className="size-4 animate-spin" />
                      Loading transactions...
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                filteredByCategory.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{formatDate(tx.createdAt)}</TableCell>
                    <TableCell className="font-medium">{tx.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {tx.category}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={tx.type === "INCOME" ? "secondary" : "outline"}
                        className={cn(
                          tx.type === "INCOME"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "border-destructive/40 text-destructive",
                        )}
                      >
                        {tx.type === "INCOME" ? "Income" : "Expense"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>{formatDate(tx.date)}</TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {tx.paymentMethod
                        .toLowerCase()
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (m) => m.toUpperCase())}
                    </TableCell>
                    <TableCell>
                      {tx.isRecurring ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                          Recurring
                        </Badge>
                      ) : (
                        <Badge variant="outline">One-time</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          tx.status === "COMPLETED" &&
                            "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                          tx.status === "PENDING" &&
                            "bg-amber-500/10 text-amber-400 border-amber-500/30",
                          tx.status === "FAILED" &&
                            "bg-destructive/10 text-destructive border-destructive/40",
                        )}
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}

              {isEmpty && !loading && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        No transactions found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search or filters, or add a new
                        transaction.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <div>
              Showing{" "}
              <span className="font-medium">
                {pagination.skip + 1}–
                {Math.min(
                  pagination.skip + pagination.pageSize,
                  pagination.totalCount,
                )}
              </span>{" "}
              of <span className="font-medium">{pagination.totalCount}</span>{" "}
              transactions
            </div>

            <Pagination className="justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    aria-disabled={page <= 1}
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    className={cn(page <= 1 && "pointer-events-none opacity-40")}
                  />
                </PaginationItem>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, idx) => idx + 1,
                ).map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={pageNumber === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    aria-disabled={
                      pagination.totalPages === 0 ||
                      page >= pagination.totalPages
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < (pagination.totalPages ?? 1)) {
                        setPage(page + 1);
                      }
                    }}
                    className={cn(
                      (pagination.totalPages === 0 ||
                        page >= pagination.totalPages) &&
                        "pointer-events-none opacity-40",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs text-destructive" aria-live="polite">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}

