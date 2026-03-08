import { SidebarComponent } from "./_components/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen w-full">
      <SidebarComponent />
      <main className="min-h-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
