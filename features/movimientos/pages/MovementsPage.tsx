"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MovementsTable } from "../components/MovementsTable";
import { CreateMovementModal } from "../components/CreateMovementModal";
import { useMovements } from "../hooks/useMovements";
import { Select } from "@/components/ui/select";
import { useSession } from "@/features/auth/client";
import { Role } from "@/lib/rbac";
import { normalizeUserForRBAC } from "@/features/auth/guards/utils";
import type { MovementFilters } from "../types";

export function MovementsPage() {
  const { session } = useSession();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState<MovementFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const normalizedUser = session?.user
    ? normalizeUserForRBAC(session.user)
    : null;
  const isAdmin = normalizedUser?.roles?.includes(Role.ADMIN) ?? false;
  const isAuthenticated = !!session?.user;

  const { data, isLoading, error, refetch } = useMovements({
    pagination: { page, limit },
    filters,
  });

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleFilterChange = (key: keyof MovementFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
    setPage(1);
  };

  const handleNextPage = () => {
    if (data?.pagination.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (data?.pagination.hasPreviousPage) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Ingresos y egresos</h1>
        {isAuthenticated && (
          <Button onClick={() => setIsModalOpen(true)}>
            Nuevo
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tipo</label>
          <Select
            value={filters.type || ""}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="w-40"
          >
            <option value="">Todos</option>
            <option value="INCOME">Ingresos</option>
            <option value="EXPENSE">Gastos</option>
          </Select>
        </div>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Error al cargar movimientos: {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => refetch()}
          >
            Reintentar
          </Button>
        </div>
      ) : (
        <>
          <MovementsTable
            movements={data?.data || []}
            isLoading={isLoading}
          />

          {data && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {(page - 1) * limit + 1} -{" "}
                {Math.min(page * limit, data.pagination.total)} de{" "}
                {data.pagination.total} movimientos
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={!data.pagination.hasPreviousPage || isLoading}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {page} de {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!data.pagination.hasNextPage || isLoading}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {isAuthenticated && session?.user?.id && (
        <CreateMovementModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSuccess={handleCreateSuccess}
          userId={session.user.id}
        />
      )}
    </div>
  );
}
