import { AdminLayout } from "@/components/layout";
import {
  ThemeSwitcher,
  AccountInformationForm,
  ConnectionsSection,
  ApiKeysSection,
} from "@/components/settings";

export default function SettingsPage() {
  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        <ThemeSwitcher />
        <AccountInformationForm />
        <ConnectionsSection />
        <ApiKeysSection />
      </div>
    </AdminLayout>
  );
}
