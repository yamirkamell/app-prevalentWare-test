"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { BalanceKPI } from "../components/BalanceKPI";
import { MovementsChart } from "../components/MovementsChart";
import { DownloadCSVButton } from "../components/DownloadCSVButton";
import { useReports } from "../hooks/useReports";
import { useSession } from "@/features/auth/client";
import { Role } from "@/lib/rbac";
import { normalizeUserForRBAC } from "@/features/auth/guards/utils";
import type { ReportFilters } from "../types";

export function ReportsPage() {
  const { session } = useSession();
  const [filters, setFilters] = useState<ReportFilters>({
    groupBy: "month",
  });
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const normalizedUser = session?.user
    ? normalizeUserForRBAC(session.user)
    : null;
  const isAdmin = normalizedUser?.roles?.includes(Role.ADMIN) ?? false;

  const { data, isLoading, error, refetch } = useReports({
    filters,
  });

  useEffect(() => {
    if (!filters.startDate && !filters.endDate) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      setFilters((prev) => ({
        ...prev,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      }));
    }
  }, []);

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Sistema de gestión de Ingresos y Gastos</h1>
        {isAdmin && (
          <DownloadCSVButton filters={filters} />
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Fecha Inicial</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Fecha Final</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="groupBy">Agrupar Por</Label>
            <Select
              id="groupBy"
              value={filters.groupBy || "month"}
              onChange={(e) =>
                handleFilterChange("groupBy", e.target.value as any)
              }
            >
              <option value="day">Día</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chartType">Tipo de Gráfico</Label>
            <Select
              id="chartType"
              value={chartType}
              onChange={(e) =>
                setChartType(e.target.value as "line" | "bar")
              }
            >
              <option value="line">Línea</option>
              <option value="bar">Barras</option>
            </Select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Error al cargar reportes: {error}
          </p>
        </div>
      )}

      {data && (
        <BalanceKPI balance={data.balance} isLoading={isLoading} />
      )}

      {data && (
        <MovementsChart
          data={data.aggregated}
          isLoading={isLoading}
          chartType={chartType}
        />
      )}

      {data && data.statistics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Estadísticas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Movimientos</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.statistics.totalMovements}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ingresos</p>
              <p className="text-2xl font-bold text-green-600">
                {data.statistics.incomeCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gastos</p>
              <p className="text-2xl font-bold text-red-600">
                {data.statistics.expenseCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Promedio Ingresos</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                }).format(data.statistics.averageIncome)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Promedio Gastos</p>
              <p className="text-2xl font-bold text-red-600">
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                }).format(data.statistics.averageExpense)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
