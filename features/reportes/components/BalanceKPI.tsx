"use client";

import type { BalanceData } from "../types";

interface BalanceKPIProps {
  balance: BalanceData;
  isLoading?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function BalanceKPI({ balance, isLoading }: BalanceKPIProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Cargando saldo...</p>
      </div>
    );
  }

  const isPositive = balance.current >= 0;
  const balanceColor = isPositive ? "text-green-600" : "text-red-600";
  const balanceBg = isPositive ? "bg-green-50" : "bg-red-50";

  return (
    <div className={`${balanceBg} rounded-lg shadow p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Saldo Actual</p>
          <p className={`text-3xl font-bold ${balanceColor} mt-2`}>
            {formatCurrency(balance.current)}
          </p>
        </div>
        <div className="text-right space-y-1">
          <div>
            <p className="text-xs text-gray-500">Ingresos</p>
            <p className="text-sm font-semibold text-green-600">
              {formatCurrency(balance.totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Gastos</p>
            <p className="text-sm font-semibold text-red-600">
              {formatCurrency(balance.totalExpense)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
