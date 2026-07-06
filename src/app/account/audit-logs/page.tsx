import { AdminLayout } from "@/components/layout/admin-layout";

export default function AuditLogsPage() {
  return (
    <AdminLayout title="Audit Logs">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">
            View your account activity and security logs.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
