import { AdminLayout } from "@/components/layout/admin-layout";

export default function PodsPage() {
  return (
    <AdminLayout title="Pods">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pods</h2>
          <p className="text-muted-foreground">
            Manage your GPU pods and compute resources.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
