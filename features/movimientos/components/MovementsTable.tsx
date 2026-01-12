"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FaInbox } from "react-icons/fa";
import type { MovementWithUser } from "../types";

interface MovementsTableProps {
  movements: MovementWithUser[];
  isLoading?: boolean;
}

function formatCurrency(amount: number | string | { toNumber?: () => number; toString?: () => string }): string {
  let numAmount: number;
  
  if (typeof amount === "string") {
    numAmount = parseFloat(amount);
  } else if (typeof amount === "number") {
    numAmount = amount;
  } else {
    // Prisma Decimal type
    numAmount = typeof amount.toNumber === "function" 
      ? amount.toNumber() 
      : parseFloat(amount.toString?.() || "0");
  }
  
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(numAmount);
}

function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
}

function getTypeColor(type: "INCOME" | "EXPENSE"): string {
  return type === "INCOME" ? "text-emerald-700 font-bold" : "text-red-700 font-bold";
}

function getTypeText(type: "INCOME" | "EXPENSE"): string {
  return type === "INCOME" ? "Ingreso" : "Gasto";
}

export function MovementsTable({ movements, isLoading }: MovementsTableProps) {
  if (isLoading) {
    return (
      <div className="w-full h-[600px] border border-slate-200 rounded-lg overflow-hidden">
        <div className="h-full overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="text-slate-600 font-medium">Cargando movimientos...</p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="w-full h-[600px] border border-slate-200 rounded-lg overflow-hidden">
        <div className="h-full overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FaInbox className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-slate-900">No hay movimientos registrados</p>
                      <p className="text-slate-600 font-medium">Comienza agregando tu primer ingreso o egreso</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] border border-slate-200 rounded-lg overflow-hidden">
      <div className="h-full overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
            <TableRow>
              <TableHead>Concepto</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Usuario</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className="font-semibold text-slate-900">{movement.concept}</TableCell>
                <TableCell className={`text-right font-bold ${getTypeColor(movement.type)}`}>
                  {formatCurrency(movement.amount)}
                </TableCell>
                <TableCell className="text-slate-700">{formatDate(movement.date)}</TableCell>
                <TableCell className="text-slate-700">{movement.user.name || movement.user.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
