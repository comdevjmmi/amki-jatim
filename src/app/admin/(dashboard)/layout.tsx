import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { logoutAdmin } from "./actions";

// Admin pages read live data with the service-role client and are gated by
// a per-request cookie check — they must never be statically prerendered
// (which would either bake stale data into the build, or crash the build
// outright when Supabase env vars aren't available at build time, as
// happened on /admin/sessions before this was added).
export const dynamic = "force-dynamic";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      <AdminSidebar logoutAction={logoutAdmin} />
      <main className="h-screen flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
