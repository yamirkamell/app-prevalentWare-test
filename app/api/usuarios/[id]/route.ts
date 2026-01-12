import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiGuard } from "@/features/auth/guards/apiGuard";
import { Role } from "@/lib/rbac";
import { updateUserSchema } from "@/features/usuarios/validators/user.validator";

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualiza un usuario (nombre y rol)
 *     description: Actualiza la información de un usuario. Solo permite editar nombre y rol. El email NO se puede editar. Requiere rol ADMIN.
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario a actualizar
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Nombre completo del usuario
 *                 example: "Juan Pérez"
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 description: Rol del usuario
 *                 example: "ADMIN"
 *           example:
 *             name: "Juan Pérez"
 *             role: "ADMIN"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     emailVerified:
 *                       type: boolean
 *                     image:
 *                       type: string
 *                       nullable: true
 *                     role:
 *                       type: string
 *                       enum: [ADMIN, USER]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     _count:
 *                       type: object
 *                       properties:
 *                         movements:
 *                           type: integer
 *                         sessions:
 *                           type: integer
 *                 message:
 *                   type: string
 *             example:
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 name: "Juan Pérez"
 *                 email: "juan@example.com"
 *                 emailVerified: true
 *                 image: null
 *                 role: "ADMIN"
 *                 createdAt: "2024-01-01T00:00:00Z"
 *                 updatedAt: "2024-01-02T00:00:00Z"
 *                 _count:
 *                   movements: 10
 *                   sessions: 2
 *               message: "Usuario actualizado exitosamente"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Conflicto - Ya existe un usuario con estos datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Validation Error"
 *               message: "Ya existe un usuario con estos datos"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const guardResult = await apiGuard(request, { role: Role.ADMIN });
    if (!guardResult.allowed || !guardResult.user) {
      return guardResult.response || NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "ID de usuario requerido",
        },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "El cuerpo de la petición debe ser un JSON válido",
        },
        { status: 400 }
      );
    }

    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Datos inválidos",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, role } = validationResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: `Usuario con ID ${userId} no encontrado`,
        },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            movements: true,
            sessions: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        data: updatedUser,
        message: "Usuario actualizado exitosamente",
      },
      { status: 200 }
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      typeof error.code === "string" &&
      error.code.startsWith("P")
    ) {
      const prismaError = error as { code: string; message?: string };
      
      if (prismaError.code === "P2003") {
        return NextResponse.json(
          {
            error: "Validation Error",
            message: "Error al actualizar el usuario",
          },
          { status: 400 }
        );
      }

      if (error.code === "P2002") {
        return NextResponse.json(
          {
            error: "Validation Error",
            message: "Ya existe un usuario con estos datos",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error: "Database Error",
          message: "Error al actualizar el usuario",
          code: error.code,
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
