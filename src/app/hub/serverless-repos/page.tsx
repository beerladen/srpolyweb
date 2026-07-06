import { AdminLayout } from "@/components/layout/admin-layout";

export default function ServerlessReposPage() {
  return (
    <AdminLayout title="Serverless Repos">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Serverless Repos</h2>
          <p className="text-muted-foreground">
            Browse and deploy serverless functions.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
