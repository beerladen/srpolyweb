import { AdminLayout } from "@/components/layout/admin-layout";

export default function FineTuningPage() {
  return (
    <AdminLayout title="Fine Tuning">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fine Tuning</h2>
          <p className="text-muted-foreground">
            Train and fine-tune your AI models.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
