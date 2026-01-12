"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FaUsers } from "react-icons/fa";
import type { UserWithCounts } from "../types";

interface UsersTableProps {
  users: UserWithCounts[];
  isLoading?: boolean;
  onEdit?: (user: UserWithCounts) => void;
}

function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

function getRoleText(role: string): string {
  return role === "ADMIN" ? "Administrador" : "Usuario";
}

function getRoleColor(role: string): string {
  return role === "ADMIN" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800";
}

export function UsersTable({ users, isLoading, onEdit }: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="w-full h-[600px] border border-slate-200 rounded-lg overflow-hidden">
        <div className="h-full overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="text-slate-600 font-medium">Cargando usuarios...</p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="w-full h-[600px] border border-slate-200 rounded-lg overflow-hidden">
        <div className="h-full overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FaUsers className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-slate-900">No hay usuarios registrados</p>
                      <p className="text-slate-600 font-medium">Los usuarios aparecerán aquí cuando se registren</p>
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
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-semibold text-slate-900">{user.name}</TableCell>
                <TableCell className="text-slate-700">{user.email}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleText(user.role)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(user)}
                    >
                      editar usuario
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
