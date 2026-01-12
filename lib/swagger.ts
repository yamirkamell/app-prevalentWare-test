import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "Documentación de la API REST",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        description: "Servidor de desarrollo",
      },
      {
        url: "https://api.example.com",
        description: "Servidor de producción",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token de autenticación JWT",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "session",
          description: "Cookie de sesión",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Mensaje de error",
            },
            message: {
              type: "string",
              description: "Descripción detallada del error",
            },
            statusCode: {
              type: "number",
              description: "Código de estado HTTP",
            },
            details: {
              type: "array",
              description: "Detalles adicionales del error (validación)",
              items: {
                type: "object",
              },
            },
          },
          required: ["error"],
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              description: "Mensaje de éxito",
            },
            data: {
              type: "object",
              description: "Datos de respuesta",
            },
          },
          required: ["success"],
        },
        Movement: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            amount: {
              type: "number",
              format: "decimal",
            },
            concept: {
              type: "string",
            },
            date: {
              type: "string",
              format: "date",
            },
            type: {
              type: "string",
              enum: ["INCOME", "EXPENSE"],
            },
            userId: {
              type: "string",
              format: "uuid",
            },
            user: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                },
                name: {
                  type: "string",
                },
                email: {
                  type: "string",
                  format: "email",
                },
              },
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            name: {
              type: "string",
            },
            email: {
              type: "string",
              format: "email",
            },
            emailVerified: {
              type: "boolean",
            },
            image: {
              type: "string",
              nullable: true,
            },
            role: {
              type: "string",
              enum: ["ADMIN", "USER"],
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              minimum: 1,
            },
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
            },
            total: {
              type: "integer",
            },
            totalPages: {
              type: "integer",
            },
            hasNextPage: {
              type: "boolean",
            },
            hasPreviousPage: {
              type: "boolean",
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "No autenticado o token inválido",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: "Unauthorized",
                message: "Authentication required",
                statusCode: 401,
              },
            },
          },
        },
        ForbiddenError: {
          description: "No tiene permisos para acceder al recurso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: "Forbidden",
                message: "Insufficient permissions",
                statusCode: 403,
              },
            },
          },
        },
        NotFoundError: {
          description: "Recurso no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: "Not Found",
                message: "Resource not found",
                statusCode: 404,
              },
            },
          },
        },
        ValidationError: {
          description: "Error de validación",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: "Validation Error",
                message: "Invalid input data",
                statusCode: 400,
              },
            },
          },
        },
        ServerError: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: "Internal Server Error",
                message: "An unexpected error occurred",
                statusCode: 500,
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Auth",
        description: "Endpoints de autenticación con Better Auth",
      },
      {
        name: "Movimientos",
        description: "Gestión de movimientos financieros (ingresos y gastos)",
      },
      {
        name: "Usuarios",
        description: "Gestión de usuarios del sistema",
      },
      {
        name: "Reportes",
        description: "Reportes financieros y análisis de datos",
      },
    ],
  },
  apis: [
    "./app/api/**/*.ts",
    "./app/api/**/*.js",
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export interface SwaggerErrorResponse {
  error: string;
  message?: string;
  statusCode: number;
  details?: unknown;
}

export interface SwaggerSuccessResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export const swaggerExamples = {
  pagination: {
    page: {
      type: "number",
      example: 1,
      minimum: 1,
      description: "Número de página",
    },
    limit: {
      type: "number",
      example: 10,
      minimum: 1,
      maximum: 100,
      description: "Cantidad de elementos por página",
    },
    total: {
      type: "number",
      example: 100,
      description: "Total de elementos",
    },
    totalPages: {
      type: "number",
      example: 10,
      description: "Total de páginas",
    },
  },
  paginationResponse: {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: {
          type: "object",
        },
      },
      pagination: {
        type: "object",
        properties: {
          page: {
            type: "number",
            example: 1,
          },
          limit: {
            type: "number",
            example: 10,
          },
          total: {
            type: "number",
            example: 100,
          },
          totalPages: {
            type: "number",
            example: 10,
          },
        },
      },
    },
  },
};

/**
 * Helper para generar documentación Swagger en un route handler
 * Ejemplo de uso:
 * 
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener lista de usuarios
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
export const swaggerComment = (documentation: string) => {
  // Esta función es solo para tipado y documentación
  // La documentación se procesa por swagger-jsdoc desde los comentarios JSDoc
  return documentation;
};
