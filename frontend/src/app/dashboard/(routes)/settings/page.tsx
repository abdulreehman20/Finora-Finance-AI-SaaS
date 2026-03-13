"use client";

import {
  ChangeEmailCard,
  ChangePasswordCard,
  DeleteAccountCard,
  ProvidersCard,
  SessionsCard,
  UpdateAvatarCard,
  UpdateNameCard,
  UpdateUsernameCard,
} from "@daveyplate/better-auth-ui";
import {
  IconMoonStars,
  IconPalette,
  IconReceipt,
  IconSettings,
  IconSun,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useState } from "react";

type SettingsTab = "settings" | "appearance" | "billing";

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "settings", label: "Account", icon: IconSettings },
  { id: "appearance", label: "Appearance", icon: IconPalette },
  { id: "billing", label: "Billings", icon: IconReceipt },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("settings");
  const { theme, setTheme } = useTheme();

  return (
    <main className="min-h-screen bg-[oklch(0.06_0.01_145)] px-6 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>

        {/* Tabbed Layout */}
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Sidebar Tabs */}
          <nav className="flex flex-row md:flex-col gap-1 md:w-48 shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">
            {/* ── Account Tab ── */}
            {activeTab === "settings" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white">Account</h2>
                  <p className="mt-0.5 text-sm text-zinc-400">
                    Update your account settings.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <UpdateAvatarCard />
                  <UpdateNameCard />
                  <UpdateUsernameCard />
                  <ChangeEmailCard />
                  <ChangePasswordCard />
                  <ProvidersCard />
                  <SessionsCard />
                  <DeleteAccountCard />
                </div>
              </div>
            )}

            {/* ── Appearance Tab ── */}
            {activeTab === "appearance" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Appearance
                  </h2>
                  <p className="mt-0.5 text-sm text-zinc-400">
                    Customize the visual style of the app.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Theme Toggle */}
                  <div className="rounded-2xl border border-white/10 bg-[oklch(0.10_0.01_145)] p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Theme
                    </h3>
                    <p className="text-sm text-zinc-400 mb-5">
                      Select your preferred color scheme
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          value: "light",
                          label: "Light",
                          icon: IconSun,
                          desc: "Bright and clean",
                        },
                        {
                          value: "dark",
                          label: "Dark",
                          icon: IconMoonStars,
                          desc: "Easy on the eyes",
                        },
                        {
                          value: "system",
                          label: "System",
                          icon: IconPalette,
                          desc: "Follows OS setting",
                        },
                      ].map((opt) => {
                        const Icon = opt.icon;
                        const isActive = theme === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setTheme(opt.value)}
                            className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                              isActive
                                ? "border-green-500/60 bg-green-500/10"
                                : "border-white/10 bg-white/5 hover:border-white/20"
                            }`}
                          >
                            <Icon
                              size={24}
                              className={
                                isActive ? "text-green-400" : "text-zinc-400"
                              }
                            />
                            <p
                              className={`mt-2 text-sm font-medium ${isActive ? "text-white" : "text-zinc-300"}`}
                            >
                              {opt.label}
                            </p>
                            <p className="text-xs text-zinc-500">{opt.desc}</p>
                            {isActive && (
                              <div className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/40" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div className="rounded-2xl border border-white/10 bg-[oklch(0.10_0.01_145)] p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Font Size
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4">
                      Adjust the base font size of the interface
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-zinc-500">A</span>
                      <input
                        type="range"
                        min={12}
                        max={18}
                        defaultValue={14}
                        className="flex-1 accent-green-500"
                      />
                      <span className="text-lg text-zinc-500">A</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Billing Tab ── */}
            {activeTab === "billing" && (
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
                        <h3 className="text-lg font-semibold text-white">
                          Current Plan
                        </h3>
                        <p className="mt-1 text-sm text-zinc-400">
                          You are on the{" "}
                          <span className="text-green-400 font-semibold">
                            Free
                          </span>{" "}
                          plan
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
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
