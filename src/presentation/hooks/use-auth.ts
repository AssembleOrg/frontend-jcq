"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/presentation/stores";

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, initializeAuth } = useAuthStore();

  // Initialize auth state from cookies on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Handle redirects
  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push("/login");
      } else if (!requireAuth && isAuthenticated) {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  return { isAuthenticated, user, isLoading };
}
