import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { getCurrentAdminUser } from "@/lib/admin-auth";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export async function AdminLayout({ children, title }: AdminLayoutProps) {
  const currentUser = await getCurrentAdminUser();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar permissions={currentUser.effectivePermissions} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={title}
          currentUser={currentUser}
          permissions={currentUser.effectivePermissions}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
