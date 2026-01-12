"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { UsersTable } from "../components/UsersTable";
import { EditUserModal } from "../components/EditUserModal";
import { useUsers } from "../hooks/useUsers";
import { useSession } from "@/features/auth/client";
import { Role } from "@/lib/rbac";
import { normalizeUserForRBAC } from "@/features/auth/guards/utils";
import type { UserFilters, UserWithCounts } from "../types";

export function UsersPage() {
  const { session } = useSession();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState<UserFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithCounts | null>(null);

  const normalizedUser = session?.user
    ? normalizeUserForRBAC(session.user)
    : null;
  const isAdmin = normalizedUser?.roles?.includes(Role.ADMIN) ?? false;

  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, error, refetch } = useUsers({
    pagination: { page, limit },
    filters: {
      ...filters,
      search: debouncedSearch || undefined,
    },
  });

  const handleEditClick = (user: UserWithCounts) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    refetch();
  };

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
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

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="rounded-md bg-red-50 p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-red-600">
            Necesitas tener rol de Administrador para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Usuarios</h1>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Buscar por nombre o email
          </label>
          <Input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Rol</label>
          <Select
            value={filters.role || ""}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="w-40"
          >
            <option value="">Todos</option>
            <option value="ADMIN">Administradores</option>
            <option value="USER">Usuarios</option>
          </Select>
        </div>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Error al cargar usuarios: {error}
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
          <UsersTable
            users={data?.data || []}
            isLoading={isLoading}
            onEdit={handleEditClick}
          />

          {data && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {(page - 1) * limit + 1} -{" "}
                {Math.min(page * limit, data.pagination.total)} de{" "}
                {data.pagination.total} usuarios
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

      <EditUserModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        user={selectedUser}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
