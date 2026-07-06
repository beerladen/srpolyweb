import { AdminLayout } from "@/components/layout/admin-layout";

export default function ServerlessPage() {
  return (
    <AdminLayout title="Serverless">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Serverless</h2>
          <p className="text-muted-foreground">
            Manage your serverless deployments and endpoints.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
