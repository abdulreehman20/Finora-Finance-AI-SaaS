"use client";

export function BillingTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Billing</h2>
        <p className="mt-0.5 text-sm text-zinc-400">
          Manage your subscription and payment details.
        </p>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <div className="rounded-2xl border border-white/10 bg-[oklch(0.10_0.01_145)] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Current Plan</h3>
              <p className="mt-1 text-sm text-zinc-400">
                You are on the{" "}
                <span className="text-green-400 font-semibold">Free</span> plan
              </p>
            </div>
            <span className="rounded-full bg-green-500/15 border border-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
              Active
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-zinc-500 mb-1">Transactions</p>
              <p className="text-xl font-bold text-white">50</p>
              <p className="text-xs text-zinc-500">per month</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-zinc-500 mb-1">Reports</p>
              <p className="text-xl font-bold text-white">Monthly</p>
              <p className="text-xs text-zinc-500">email digest</p>
            </div>
          </div>

          <button
            type="button"
            className="mt-5 w-full rounded-xl bg-green-500 py-3 text-sm font-semibold text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
          >
            Upgrade Plan
          </button>
        </div>

        {/* Billing History */}
        <div className="rounded-2xl border border-white/10 bg-[oklch(0.10_0.01_145)] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Billing History
          </h3>
          <p className="text-sm text-zinc-500">
            No billing history available. Your current plan is free.
          </p>
        </div>
      </div>
    </div>
  );
}
