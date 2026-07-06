import { AdminLayout } from "@/components/layout/admin-layout";

export default function PublicEndpointsPage() {
  return (
    <AdminLayout title="Public Endpoints">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Public Endpoints</h2>
          <p className="text-muted-foreground">
            Browse and use publicly available API endpoints.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
