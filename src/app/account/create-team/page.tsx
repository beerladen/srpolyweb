import { AdminLayout } from "@/components/layout/admin-layout";

export default function CreateTeamPage() {
  return (
    <AdminLayout title="Create Team">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Team</h2>
          <p className="text-muted-foreground">
            Create a new team to collaborate with others.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
