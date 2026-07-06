import { AdminLayout } from "@/components/layout/admin-layout";

export default function RemoteAccessPage() {
  return (
    <AdminLayout title="Remote Access">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Remote Access</h2>
          <p className="text-muted-foreground">
            Configure SSH keys and remote access settings.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
