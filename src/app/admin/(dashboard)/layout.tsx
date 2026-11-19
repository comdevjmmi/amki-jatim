import { AdminShell } from "@/components/admin/admin-shell";
import { logoutAdmin } from "./actions";

// Admin pages read live data with the service-role client and are gated by
// a per-request cookie check — they must never be statically prerendered
// (which would either bake stale data into the build, or crash the build
// outright when Supabase env vars aren't available at build time, as
// happened on /admin/sessions before this was added).
export const dynamic = "force-dynamic";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell logoutAction={logoutAdmin}>{children}</AdminShell>;
}
