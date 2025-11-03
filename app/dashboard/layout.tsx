"use client";

import { Sidebar } from "@/src/presentation/components/layout/sidebar";
import { useAuth } from "@/src/presentation/hooks/use-auth";
import { LoadingScreen } from "@/src/presentation/components/ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth(true);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Sidebar />
      <main
        style={{
          marginLeft: "0",
          minHeight: "100vh",
          overflowY: "auto",
          backgroundColor: "#0a0a0a",
          paddingTop: "env(safe-area-inset-top)",
        }}
        className="dashboard-main"
      >
        {children}
      </main>
    </>
  );
}
