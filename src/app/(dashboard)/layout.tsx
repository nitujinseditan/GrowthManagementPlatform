import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import AuthGuard from "@/components/layout/AuthGuard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <AuthGuard>
      <DashboardShell userName={session.user?.name || undefined}>
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}
