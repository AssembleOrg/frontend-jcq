"use client";

import { LoginFormMantine } from "@/src/presentation/components/auth/login-form-mantine";
import { useAuth } from "@/src/presentation/hooks/use-auth";
import { LoadingScreen } from "@/src/presentation/components/ui";

export default function LoginPage() {
  const { isLoading } = useAuth(false);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <LoginFormMantine />;
}
