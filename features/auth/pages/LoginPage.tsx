"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../hooks/useSession";
import { AuthTabs } from "../components/AuthTabs";
import { GitHubAuthButton } from "../components/GitHubAuthButton";
import { Loading } from "@/components/ui/loading";

export function LoginPage() {
  const router = useRouter();
  const { session, isLoading, isAuthenticated } = useSession();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" text="Cargando..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido</h1>
          <p className="mt-2 text-gray-600">
            Inicia sesión o crea una cuenta para continuar
          </p>
        </div>

        <AuthTabs />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-50 px-2 text-gray-500">O continúa con</span>
          </div>
        </div>

        <GitHubAuthButton />
      </div>
    </div>
  );
}
