import { AdminLayout } from "@/components/layout/admin-layout";

export default function SecretsPage() {
  return (
    <AdminLayout title="Secrets">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Secrets</h2>
          <p className="text-muted-foreground">
            Manage your environment variables and secrets.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
