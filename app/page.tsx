"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, useAuth } from "@/features/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { session, isLoading, isAuthenticated, refresh } = useSession();
  const { logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        router.replace("/login");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === "visible" && isAuthenticated) {
        refresh();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refresh, isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      router.replace("/login");
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
        <Loading size="lg" text="Cargando sesión..." />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
        <Loading size="lg" text="Redirigiendo..." />
      </main>
    );
  }

      const user = session?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Sistema de gestión de Ingresos y Gastos
          </h1>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Bienvenido</CardTitle>
              <CardDescription>
                Has iniciado sesión correctamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {user.image && (
                    <img
                      src={user.image}
                      alt={user.name || "Avatar"}
                      className="w-20 h-20 rounded-full border-2 border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {user.name || "Usuario"}
                    </h2>
                    <p className="text-gray-600">{user.email || "Sin email"}</p>
                    <div className="mt-2">
                      <Badge variant={(user as any).role === "ADMIN" ? "default" : "secondary"}>
                        {(user as any).role || "USER"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    Sesión activa pero no se pudo cargar la información del usuario.
                  </p>
                  <p className="text-yellow-600 text-xs mt-2">
                    Por favor, intenta refrescar la página o cerrar sesión y volver a iniciar.
                  </p>
                </div>
              </div>
            )}

              <div className="pt-4 border-t border-gray-200">
                <Button onClick={handleLogout} variant="destructive" className="w-full">
                  Cerrar sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader>
              <CardTitle>Sistema de gestión de ingresos y gastos</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <Link href="/movimientos" className="w-full">
                <Button className="w-full">Ir a Movimientos</Button>
              </Link>
            </CardContent>
          </Card>

          {(session?.user as any)?.role === "ADMIN" && (
            <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardHeader>
                <CardTitle>Gestión de usuarios</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <Link href="/usuarios" className="w-full">
                  <Button className="w-full">Ir a Usuarios</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {(session?.user as any)?.role === "ADMIN" && (
            <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardHeader>
                <CardTitle>Reportes</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <Link href="/reportes" className="w-full">
                  <Button className="w-full">Ir a Reportes</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
