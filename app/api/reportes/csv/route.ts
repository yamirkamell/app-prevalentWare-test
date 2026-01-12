import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiGuard } from "@/features/auth/guards/apiGuard";
import { Role } from "@/lib/rbac";
import type { Prisma } from "@prisma/client";
import { getCSVQuerySchema } from "@/features/reportes/validators/report.validator";

/**
 * @swagger
 * /api/reportes/csv:
 *   get:
 *     summary: Descarga un CSV con todos los movimientos
 *     description: Genera y descarga un archivo CSV con todos los movimientos. Los usuarios regulares solo ven sus propios movimientos, mientras que los ADMIN pueden ver todos y filtrar por userId.
 *     tags: [Reportes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           pattern: '^\\d{4}-\\d{2}-\\d{2}$'
 *         description: Fecha inicial del rango (formato YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           pattern: '^\\d{4}-\\d{2}-\\d{2}$'
 *         description: Fecha final del rango (formato YYYY-MM-DD)
 *         example: "2024-12-31"
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de usuario (solo ADMIN)
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Archivo CSV descargado exitosamente
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *             example: |
 *               Fecha,Concepto,Tipo,Monto,Usuario,Email
 *               2024-01-15,Venta de producto,Ingreso,1500.50,Juan Pérez,juan@example.com
 *               2024-01-16,Compra de materiales,Gasto,500.00,Juan Pérez,juan@example.com
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(request: NextRequest) {
  try {
    const guardResult = await apiGuard(request, { role: Role.ADMIN });
    if (!guardResult.allowed || !guardResult.user) {
      return guardResult.response || NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = getCSVQuerySchema.safeParse(queryParams);
    if (!validatedQuery.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Parámetros de consulta inválidos",
          details: validatedQuery.error.issues,
        },
        { status: 400 }
      );
    }

    const { startDate, endDate, userId: filterUserId } = validatedQuery.data;

    const where: Prisma.MovementWhereInput = {};

    if (filterUserId) {
      where.userId = filterUserId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startDate;
      }
      if (endDate) {
        where.date.lte = endDate;
      }
    }

    const movements = await prisma.movement.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const csvHeader = "Fecha,Concepto,Tipo,Monto,Usuario,Email\n";
    const csvRows = movements.map((movement) => {
      const date = new Date(movement.date).toISOString().split("T")[0];
      const concept = escapeCSVField(movement.concept);
      const type = movement.type === "INCOME" ? "Ingreso" : "Gasto";
      const amount = Number(movement.amount).toFixed(2);
      const userName = escapeCSVField(movement.user.name);
      const userEmail = escapeCSVField(movement.user.email);

      return `${date},${concept},${type},${amount},${userName},${userEmail}`;
    });

    const csvContent = csvHeader + csvRows.join("\n");

    const now = new Date();
    const filename = `reporte-movimientos-${now.toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      typeof error.code === "string" &&
      error.code.startsWith("P")
    ) {
      const prismaError = error as { code: string; message?: string };
      return NextResponse.json(
        {
          error: "Database Error",
          message: "Error al consultar la base de datos",
          code: prismaError.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

function escapeCSVField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
