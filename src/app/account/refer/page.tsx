import { AdminLayout } from "@/components/layout/admin-layout";

export default function ReferPage() {
  return (
    <AdminLayout title="Refer & Earn">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Refer &amp; Earn</h2>
          <p className="text-muted-foreground">
            Invite friends and earn credits for each referral.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
