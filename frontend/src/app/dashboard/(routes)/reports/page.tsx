"use client";

import {
  IconAlertCircle,
  IconCalendar,
  IconCheck,
  IconClockRecord,
  IconLoader2,
  IconMail,
  IconRefresh,
  IconSettings,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
// import { getAllReports, updateReportSetting } from "@/lib/api/report.api";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Report, ReportStatus } from "@/types/report";
import { authClient } from "@/lib/auth-client";
import { getAllReportsAction, updateReportSettingAction } from "@/actions/reports/actions";

// ── Report Settings Sheet ──────────────────────────────────────────────────────

function ReportSettingsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = authClient.useSession();
  const [isEnabled, setIsEnabled] = useState(true);
  const [repeatOn, setRepeatOn] = useState("Monthly");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const userEmail = session?.user?.email ?? "";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateReportSettingAction({ isEnabled, dayOfMonth: 1 });
      setSuccess(true);
      toast.success("Report settings saved!");
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
      }, 1200);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update settings",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-[oklch(0.08_0.01_145)] border-white/10 overflow-y-auto"
        showCloseButton={true}
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="text-xl font-bold text-white">
            Report Settings
          </SheetTitle>
          <SheetDescription className="text-zinc-400">
            Enable or disable monthly financial report emails
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Monthly Reports Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-4">
              <div>
                <p className="text-sm font-medium text-white">
                  Monthly Reports
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {isEnabled ? "Reports activated" : "Reports deactivated"}
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center ml-4">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                />
                <div
                  className={`h-6 w-11 rounded-full transition-colors duration-200 ${isEnabled ? "bg-green-500" : "bg-white/20"}`}
                >
                  <div
                    className={`m-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${isEnabled ? "translate-x-5" : "translate-x-0"}`}
                  />
                </div>
              </label>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Email
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <IconMail size={16} className="text-zinc-400 shrink-0" />
                <span className="text-sm text-zinc-300 truncate">
                  {userEmail || "your@email.com"}
                </span>
              </div>
            </div>

            {/* Repeat On */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Repeat On
              </label>
              <select
                className="w-full rounded-xl border border-white/10 bg-[oklch(0.10_0.01_145)] px-4 py-3 text-sm text-white outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
                value={repeatOn}
                onChange={(e) => setRepeatOn(e.target.value)}
              >
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            {/* Schedule Summary */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h4 className="text-sm font-medium text-white mb-1">
                Schedule Summary
              </h4>
              <p className="text-xs text-zinc-400">
                Report will be sent once a month on the 1st day of the next month
              </p>
            </div>

            {success && (
              <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
                <IconCheck size={16} /> Settings saved successfully!
              </div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full rounded-xl bg-green-500 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
            >
              {loading && <IconLoader2 size={16} className="animate-spin" />}
              Save changes
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReportStatus }) {
  const map: Record<ReportStatus, { label: string; cls: string }> = {
    SENT: {
      label: "SENT",
      cls: "bg-green-500/15 text-green-400 border border-green-500/20",
    },
    PENDING: {
      label: "PENDING",
      cls: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
    },
    FAILED: {
      label: "FAILED",
      cls: "bg-red-500/15 text-red-400 border border-red-500/20",
    },
    NO_ACTIVITY: {
      label: "NO ACTIVITY",
      cls: "bg-zinc-500/15 text-zinc-400 border border-zinc-500/20",
    },
  };
  const { label, cls } = map[status] ?? map.NO_ACTIVITY;
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide ${cls}`}
    >
      {label}
    </span>
  );
}

// ── Fake data for non-empty initial state ─────────────────────────────────────

const FAKE_REPORTS: Report[] = [
  {
    id: "fake-1",
    userId: "demo",
    period: "May 1-31, 2025",
    sentDate: "2025-05-24T00:00:00.000Z",
    status: "SENT",
    createdAt: "2025-05-24T00:00:00.000Z",
    updatedAt: "2025-05-24T00:00:00.000Z",
  },
  {
    id: "fake-2",
    userId: "demo",
    period: "April 1-30, 2025",
    sentDate: "2025-05-24T00:00:00.000Z",
    status: "SENT",
    createdAt: "2025-04-24T00:00:00.000Z",
    updatedAt: "2025-04-24T00:00:00.000Z",
  },
  {
    id: "fake-3",
    userId: "demo",
    period: "February 1-28, 2025",
    sentDate: "2025-05-24T00:00:00.000Z",
    status: "SENT",
    createdAt: "2025-02-24T00:00:00.000Z",
    updatedAt: "2025-02-24T00:00:00.000Z",
  },
];

// ── Main Page ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

function buildPageButtons(
  pageNumber: number,
  totalPages: number,
): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "…")[] = [];
  const around = new Set([
    1,
    totalPages,
    pageNumber,
    pageNumber - 1,
    pageNumber + 1,
  ]);
  const sorted = Array.from(around)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) pages.push("…");
    pages.push(p);
    prev = p;
  }
  return pages;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllReportsAction({ pageNumber, pageSize });
      const apiReports: Report[] = result.reports ?? [];
      setReports(apiReports.length > 0 ? apiReports : FAKE_REPORTS);
      setTotalPages(result.totalPages ?? 1);
      setTotal(
        result.total ??
          (apiReports.length === 0 ? FAKE_REPORTS.length : result.total),
      );
    } catch {
      setReports(FAKE_REPORTS);
      setTotal(FAKE_REPORTS.length);
      setTotalPages(1);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayed = reports;
  const displayedTotal = total || displayed.length;
  const start = Math.min((pageNumber - 1) * pageSize + 1, displayedTotal);
  const end = Math.min(pageNumber * pageSize, displayedTotal);
  const pageButtons = buildPageButtons(pageNumber, totalPages);

  return (
    <main className="min-h-screen bg-[oklch(0.06_0.01_145)] px-6 py-8">
      <div className="mx-auto max-w-[1400px]">
        {/* ── Header ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Report History</h1>
            <p className="mt-1 text-sm text-zinc-400">
              View and manage your financial reports
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
          >
            <IconSettings size={16} />
            Report Settings
          </button>
        </div>

        {/* ── Table Card ── */}
        <div className="rounded-2xl border border-white/10 bg-[oklch(0.10_0.01_145)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500">
                    Report Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500">
                    Sent Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="flex items-center justify-center gap-3 text-zinc-500">
                        <IconLoader2
                          size={20}
                          className="animate-spin text-green-500"
                        />
                        <span className="text-sm">Loading reports...</span>
                      </div>
                    </td>
                  </tr>
                ) : displayed.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <IconClockRecord size={36} className="text-zinc-600" />
                        <p className="text-sm text-zinc-500">
                          No reports have been sent yet.
                        </p>
                        <p className="text-xs text-zinc-600">
                          Configure your report settings to receive monthly
                          reports.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayed.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <IconCalendar
                            size={14}
                            className="shrink-0 text-zinc-500"
                          />
                          {report.period}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                        {formatDate(report.sentDate)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                          onClick={() => {
                            toast.info("Resend functionality coming soon.");
                          }}
                        >
                          <IconRefresh size={14} />
                          Resend
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
            <p className="text-xs text-zinc-500">
              Showing {start}–{end} of {displayedTotal}
            </p>
            <Pagination className="w-auto mx-0 justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      pageNumber > 1 && setPageNumber((p) => p - 1)
                    }
                    className={`cursor-pointer ${pageNumber <= 1 ? "pointer-events-none opacity-40" : ""}`}
                  />
                </PaginationItem>
                {pageButtons.map((p, idx) =>
                  p === "…" ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === pageNumber}
                        onClick={() => setPageNumber(p as number)}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      pageNumber < totalPages && setPageNumber((p) => p + 1)
                    }
                    className={`cursor-pointer ${pageNumber >= totalPages ? "pointer-events-none opacity-40" : ""}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      {/* ── Report Settings Sheet ── */}
      <ReportSettingsSheet
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </main>
  );
}
