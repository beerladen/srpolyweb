import { AdminLayout } from "@/components/layout/admin-layout";

export default function StoragePage() {
  return (
    <AdminLayout title="Storage">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Storage</h2>
          <p className="text-muted-foreground">
            Manage your network storage volumes.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
