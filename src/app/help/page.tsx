import { AdminLayout } from "@/components/layout/admin-layout";

export default function HelpPage() {
  return (
    <AdminLayout title="Help & Resources">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Help &amp; Resources</h2>
          <p className="text-muted-foreground">
            Documentation, tutorials, and support resources.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
