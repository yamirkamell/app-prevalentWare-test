import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiGuard } from "@/features/auth/guards/apiGuard";
import { Role } from "@/lib/rbac";
import type { Prisma } from "@prisma/client";
import { getReportsQuerySchema } from "@/features/reportes/validators/report.validator";

/**
 * @swagger
 * /api/reportes:
 *   get:
 *     summary: Obtiene reportes agregados y saldo actual
 *     description: Calcula el saldo actual (ingresos - gastos) y proporciona datos agregados por período. Los usuarios regulares solo ven sus propios movimientos, mientras que los ADMIN pueden ver todos y filtrar por userId.
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
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: month
 *         description: Agrupación de datos por período
 *         example: "month"
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de usuario (solo ADMIN)
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Reportes obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: number
 *                       format: decimal
 *                       description: Saldo actual (ingresos - gastos)
 *                       example: 15000.50
 *                     totalIncome:
 *                       type: number
 *                       format: decimal
 *                       description: Total de ingresos
 *                       example: 25000.00
 *                     totalExpense:
 *                       type: number
 *                       format: decimal
 *                       description: Total de gastos
 *                       example: 10000.50
 *                 aggregated:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       period:
 *                         type: string
 *                         description: Período de agrupación
 *                         example: "2024-01"
 *                       income:
 *                         type: number
 *                         format: decimal
 *                         example: 5000.00
 *                       expense:
 *                         type: number
 *                         format: decimal
 *                         example: 2000.00
 *                       balance:
 *                         type: number
 *                         format: decimal
 *                         example: 3000.00
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     totalMovements:
 *                       type: integer
 *                       example: 50
 *                     incomeCount:
 *                       type: integer
 *                       example: 30
 *                     expenseCount:
 *                       type: integer
 *                       example: 20
 *                     averageIncome:
 *                       type: number
 *                       format: decimal
 *                       example: 833.33
 *                     averageExpense:
 *                       type: number
 *                       format: decimal
 *                       example: 500.00
 *             example:
 *               balance:
 *                 current: 15000.50
 *                 totalIncome: 25000.00
 *                 totalExpense: 10000.50
 *               aggregated:
 *                 - period: "2024-01"
 *                   income: 5000.00
 *                   expense: 2000.00
 *                   balance: 3000.00
 *                 - period: "2024-02"
 *                   income: 6000.00
 *                   expense: 2500.00
 *                   balance: 3500.00
 *               statistics:
 *                 totalMovements: 50
 *                 incomeCount: 30
 *                 expenseCount: 20
 *                 averageIncome: 833.33
 *                 averageExpense: 500.00
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

    const validatedQuery = getReportsQuerySchema.safeParse(queryParams);
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

    const { startDate, endDate, groupBy, userId: filterUserId } = validatedQuery.data;

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

    const [incomeSum, expenseSum] = await Promise.all([
      prisma.movement.aggregate({
        where: {
          ...where,
          type: "INCOME",
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.movement.aggregate({
        where: {
          ...where,
          type: "EXPENSE",
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const totalIncome = Number(incomeSum._sum.amount || 0);
    const totalExpense = Number(expenseSum._sum.amount || 0);
    const currentBalance = totalIncome - totalExpense;

    const movements = await prisma.movement.findMany({
      where,
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    const groupedData = groupMovementsByPeriod(movements, groupBy);

    const totalMovements = movements.length;
    const incomeCount = movements.filter((m) => m.type === "INCOME").length;
    const expenseCount = movements.filter((m) => m.type === "EXPENSE").length;

    return NextResponse.json({
      balance: {
        current: currentBalance,
        totalIncome,
        totalExpense,
      },
      aggregated: groupedData,
      statistics: {
        totalMovements,
        incomeCount,
        expenseCount,
        averageIncome: incomeCount > 0 ? totalIncome / incomeCount : 0,
        averageExpense: expenseCount > 0 ? totalExpense / expenseCount : 0,
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

function groupMovementsByPeriod(
  movements: Array<{ amount: any; type: string; date: Date | string }>,
  groupBy: "day" | "week" | "month"
): Array<{ period: string; income: number; expense: number; balance: number }> {
  const grouped = new Map<string, { income: number; expense: number }>();

  movements.forEach((movement) => {
    const date = typeof movement.date === "string" ? new Date(movement.date) : movement.date;
    const amount = Number(movement.amount);

    let periodKey: string;

    switch (groupBy) {
      case "day":
        periodKey = date.toISOString().split("T")[0];
        break;
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        periodKey = `Semana ${weekStart.toISOString().split("T")[0]}`;
        break;
      case "month":
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      default:
        periodKey = date.toISOString().split("T")[0];
    }

    if (!grouped.has(periodKey)) {
      grouped.set(periodKey, { income: 0, expense: 0 });
    }

    const group = grouped.get(periodKey)!;
    if (movement.type === "INCOME") {
      group.income += amount;
    } else {
      group.expense += amount;
    }
  });

  return Array.from(grouped.entries())
    .map(([period, data]) => ({
      period,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}
