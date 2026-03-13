"use client";

import {
  IconAlertCircle,
  IconArrowDownRight,
  IconArrowUpRight,
  IconChartPie,
  IconCurrencyDollar,
  IconLoader2,
  IconPlus,
  IconTrendingDown,
  IconTrendingUp,
  IconWallet,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  type AnalyticsPreset,
  getChartAnalyticsAction,
  getExpenseBreakdownAction,
  getSummaryAnalyticsAction,
} from "@/actions/analytics/actions";
import { authClient } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/helper";
import { AddTransactionSheet } from "./(routes)/transactions/_components/add-transaction-sheet";
import { RecentTransactions } from "./_components/recent-transaction";

// ── Constants ─────────────────────────────────────────────────────────────────

const PRESETS: { label: string; value: AnalyticsPreset }[] = [
  { label: "Last 7 Days", value: "1W" },
  { label: "Last 30 Days", value: "1M" },
  { label: "Last 3 Months", value: "3M" },
  { label: "Last 6 Months", value: "6M" },
  { label: "Last Year", value: "1Y" },
  { label: "All Time", value: "ALL" },
];

// Pie chart colour palette
const PIE_COLORS = [
  "#10b981", // emerald-500
  "#3b82f6", // blue-500
  "#f97316", // orange-500
  "#a855f7", // purple-500
  "#ec4899", // pink-500
  "#6b7280", // gray-500
];

// ── Small helpers ─────────────────────────────────────────────────────────────

function formatShortCurrency(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k`;
  return `$${val.toFixed(0)}`;
}

function Trend({
  value,
  inverse = false,
}: {
  value: number;
  inverse?: boolean;
}) {
  const isPositive = inverse ? value < 0 : value > 0;
  const color = isPositive ? "text-green-400" : "text-red-400";
  const Icon = value >= 0 ? IconArrowUpRight : IconArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${color}`}
    >
      <Icon size={13} />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  subLabel: string;
  trend?: number;
  trendInverse?: boolean;
  icon: React.ReactNode;
  accent?: string;
  extra?: React.ReactNode;
}

function StatCard({
  label,
  value,
  subLabel,
  trend,
  trendInverse,
  icon,
  accent = "from-green-500/20 to-transparent",
  extra,
}: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[oklch(0.12_0.02_145)] to-[oklch(0.08_0.01_145)] p-6`}
    >
      {/* gradient accent blob */}
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${accent} blur-2xl`}
      />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
            {label}
          </p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-zinc-400">
            {icon}
          </div>
        </div>
        <p className="mb-1 text-3xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-500">{subLabel}</p>
        {(trend !== undefined || extra) && (
          <div className="mt-3 flex items-center gap-2">
            {trend !== undefined && (
              <Trend value={trend} inverse={trendInverse} />
            )}
            {extra}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [preset, setPreset] = useState<AnalyticsPreset>("ALL");
  const [showAddTx, setShowAddTx] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Data state
  const [summary, setSummary] = useState<Awaited<
    ReturnType<typeof getSummaryAnalyticsAction>
  > | null>(null);
  const [chartData, setChartData] = useState<
    { date: string; income: number; expenses: number }[]
  >([]);
  const [chartCounts, setChartCounts] = useState({
    income: 0,
    expenses: 0,
    label: "All Time",
  });
  const [breakdown, setBreakdown] = useState<
    { name: string; value: number; percentage: number }[]
  >([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchAll = useCallback((p: AnalyticsPreset) => {
    startTransition(async () => {
      setLoadError(null);
      try {
        const [sum, chart, pie] = await Promise.all([
          getSummaryAnalyticsAction(p),
          getChartAnalyticsAction(p),
          getExpenseBreakdownAction(p),
        ]);
        setSummary(sum);
        setChartData(chart.chartData);
        setChartCounts({
          income: chart.totalIncomeCount,
          expenses: chart.totalExpenseCount,
          label: chart.preset.label,
        });
        setBreakdown(pie.breakdown);
        setTotalSpent(pie.totalSpent);
      } catch {
        setLoadError("Failed to load analytics. Please try again.");
      }
    });
  }, []);

  useEffect(() => {
    fetchAll(preset);
  }, [preset, fetchAll]);

  const userName =
    session?.user?.name ??
    (session?.user as Record<string, string>)?.username ??
    "there";

  const presetLabel =
    PRESETS.find((p) => p.value === preset)?.label ?? "All Time";

  return (
    <main className="min-h-screen bg-[oklch(0.06_0.01_145)] px-6 py-8">
      <div className="mx-auto max-w-[1400px] space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, <span className="text-green-400">{userName}</span>
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              This is your overview report for the selected period
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {/* Timeline selector */}
            <div className="relative">
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value as AnalyticsPreset)}
                className="appearance-none rounded-xl border border-white/15 bg-white/5 py-2.5 pl-3 pr-8 text-sm text-zinc-300 outline-none hover:border-white/25 transition-all cursor-pointer"
              >
                {PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Add Transaction */}
            <button
              type="button"
              onClick={() => setShowAddTx(true)}
              className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
            >
              <IconPlus size={16} />
              Add Transaction
            </button>
          </div>
        </div>

        {/* ── Error ── */}
        {loadError && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <IconAlertCircle size={18} />
            {loadError}
          </div>
        )}

        {/* ── Summary Cards ── */}
        {isPending && !summary ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Available Balance"
              value={`$${summary.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subLabel={`Showing across ${presetLabel}`}
              trend={summary.percentageChange.balance}
              icon={<IconWallet size={16} />}
              accent="from-green-500/20 to-transparent"
            />
            <StatCard
              label="Total Income"
              value={`$${summary.totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subLabel={`Showing across ${presetLabel}`}
              trend={summary.percentageChange.income}
              icon={<IconTrendingUp size={16} />}
              accent="from-blue-500/15 to-transparent"
            />
            <StatCard
              label="Total Expenses"
              value={`-$${summary.totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subLabel={`Showing across ${presetLabel}`}
              trend={summary.percentageChange.expenses}
              trendInverse
              icon={<IconTrendingDown size={16} />}
              accent="from-red-500/15 to-transparent"
            />
            <StatCard
              label="Savings Rate"
              value={`${summary.savingRate.percentage.toFixed(1)}%`}
              subLabel={`Showing across ${presetLabel}`}
              icon={<IconChartPie size={16} />}
              accent="from-purple-500/15 to-transparent"
              extra={
                <span className="text-xs text-zinc-500">
                  {summary.savingRate.expenseRatio.toFixed(1)}% expense ratio
                </span>
              }
            />
          </div>
        ) : null}

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          {/* ── Transaction Overview Chart ── */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[oklch(0.11_0.02_145)] to-[oklch(0.08_0.01_150)] p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Transaction Overview
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Showing total transactions across {chartCounts.label}
                </p>
              </div>
              {/* Income / Expense counts */}
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-xs text-zinc-500">No of Income</p>
                  <div className="flex items-center justify-end gap-1">
                    <IconTrendingUp size={14} className="text-green-400" />
                    <span className="text-xl font-bold text-white">
                      {chartCounts.income}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">No of Expenses</p>
                  <div className="flex items-center justify-end gap-1">
                    <IconTrendingDown size={14} className="text-red-400" />
                    <span className="text-xl font-bold text-white">
                      {chartCounts.expenses}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {isPending ? (
              <div className="flex h-72 items-center justify-center">
                <IconLoader2
                  size={28}
                  className="animate-spin text-green-500"
                />
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex h-72 items-center justify-center text-sm text-zinc-500">
                No transaction data for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorIncome"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorExpenses"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: string) => {
                      const d = new Date(v);
                      return `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => formatShortCurrency(v)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.14 0.01 145)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                    formatter={(val: number, name: string) => [
                      `$${val.toLocaleString()}`,
                      name.charAt(0).toUpperCase() + name.slice(1),
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorIncome)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#colorExpenses)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Expenses Breakdown Chart ── */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[oklch(0.11_0.01_150)] to-[oklch(0.08_0.02_140)] p-6">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-white">
                Expenses Breakdown
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Total expenses across {presetLabel}
              </p>
            </div>

            {isPending ? (
              <div className="flex h-72 items-center justify-center">
                <IconLoader2
                  size={28}
                  className="animate-spin text-green-500"
                />
              </div>
            ) : breakdown.length === 0 ? (
              <div className="flex h-72 items-center justify-center text-sm text-zinc-500">
                No expense data for this period.
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5">
                {/* Donut Chart */}
                <div className="relative">
                  <PieChart width={220} height={220}>
                    <Pie
                      data={breakdown}
                      cx={110}
                      cy={110}
                      innerRadius={72}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {breakdown.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                  {/* Centre label */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-xl font-bold text-white">
                      $
                      {totalSpent.toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-xs text-zinc-500">Total Spent</p>
                  </div>
                </div>

                {/* Legend */}
                <div className="w-full space-y-2.5">
                  {breakdown.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                        }}
                      />
                      <span className="flex-1 truncate text-sm text-zinc-300">
                        {item.name}
                      </span>
                      <span className="shrink-0 text-sm font-medium text-white">
                        $
                        {item.value.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </span>
                      <span className="w-9 shrink-0 text-right text-xs text-zinc-500">
                        ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Transactions ── */}
        <RecentTransactions />
      </div>

      {/* ── Add Transaction Sheet ── */}
      <AddTransactionSheet
        open={showAddTx}
        onOpenChange={setShowAddTx}
        onSaved={() => fetchAll(preset)}
      />
    </main>
  );
}
