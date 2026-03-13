"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Loader2Icon, Settings2Icon } from "lucide-react";

type Report = {
  id: string;
  userId: string;
  period: string;
  sentDate: string;
  status: "SENT" | "PENDING" | "FAILED" | "NO_ACTIVITY";
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

type ReportsResponse = {
  message: string;
  reports: Report[];
  pagination: PaginationMeta;
};

const backendURL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000";

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("pageSize", String(pageSize));
        params.set("pageNumber", String(page));

        const res = await fetch(
          `${backendURL}/api/report/all?${params.toString()}`,
          { credentials: "include" },
        );

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as
            | { message?: string }
            | null;
          throw new Error(body?.message || "Failed to load reports");
        }

        const data = (await res.json()) as ReportsResponse;
        setReports(data.reports ?? []);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    void loadReports();
  }, [page, pageSize]);

  async function handleResend(report: Report) {
    const sent = new Date(report.sentDate);
    const to = sent.toISOString();
    const from = new Date(sent);
    from.setDate(from.getDate() - 30);

    try {
      const params = new URLSearchParams();
      params.set("from", from.toISOString());
      params.set("to", to);

      const res = await fetch(
        `${backendURL}/api/report/generate?${params.toString()}`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(body?.message || "Failed to resend report");
      }

      // Re-fetch reports to refresh history
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend report");
    }
  }

  const isEmpty = !loading && reports.length === 0;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Report History
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            View and manage your monthly financial reports. Resend a report to
            your inbox or adjust your report settings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-dashed"
          >
            <Settings2Icon className="size-4" />
            Report Settings
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border bg-card/70 p-4 shadow-sm">
        <div className="overflow-hidden rounded-lg border bg-background/40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Period</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2Icon className="size-4 animate-spin" />
                      Loading reports...
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {report.period}
                    </TableCell>
                    <TableCell>{formatDate(report.sentDate)}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          report.status === "SENT" &&
                            "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                          report.status === "PENDING" &&
                            "bg-amber-500/10 text-amber-400 border-amber-500/30",
                          report.status === "FAILED" &&
                            "bg-destructive/10 text-destructive border-destructive/40",
                          report.status === "NO_ACTIVITY" &&
                            "bg-muted text-muted-foreground border-border/60",
                        )}
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => void handleResend(report)}
                      >
                        Resend
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

              {isEmpty && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">No reports yet</p>
                      <p className="text-xs text-muted-foreground">
                        Generate your first report from the overview page to see
                        it appear here.
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
              reports
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

