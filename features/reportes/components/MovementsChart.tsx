"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AggregatedData } from "../types";

interface MovementsChartProps {
  data: AggregatedData[];
  isLoading?: boolean;
  chartType?: "line" | "bar";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function MovementsChart({
  data,
  isLoading,
  chartType = "line",
}: MovementsChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Cargando gráfico...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Movimientos por Período
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        {chartType === "line" ? (
          <LineChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              width={100}
              padding={{ top: 10, bottom: 10 }}
            />
            <Tooltip
              formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ""}
              labelStyle={{ color: "#374151" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={2}
              name="Ingresos"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              name="Gastos"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Balance"
              dot={{ r: 4 }}
            />
          </LineChart>
        ) : (
          <BarChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              width={100}
              padding={{ top: 10, bottom: 10 }}
            />
            <Tooltip
              formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ""}
              labelStyle={{ color: "#374151" }}
            />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Ingresos" />
            <Bar dataKey="expense" fill="#ef4444" name="Gastos" />
            <Bar dataKey="balance" fill="#3b82f6" name="Balance" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
