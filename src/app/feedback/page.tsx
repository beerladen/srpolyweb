import { AdminLayout } from "@/components/layout/admin-layout";

export default function FeedbackPage() {
  return (
    <AdminLayout title="Feedback">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Feedback</h2>
          <p className="text-muted-foreground">
            Share your feedback to help us improve.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
