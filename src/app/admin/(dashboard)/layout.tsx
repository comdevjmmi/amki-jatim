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
    <div className="flex min-h-screen">
      <AdminSidebar logoutAction={logoutAdmin} />
      <main className="flex-1 min-h-screen overflow-y-auto bg-slate-50/50 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
