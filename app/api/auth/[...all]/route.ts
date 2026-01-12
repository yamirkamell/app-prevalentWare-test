import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

/**
 * @swagger
 * /api/auth/{path}:
 *   get:
 *     summary: Endpoints de autenticación (Better Auth)
 *     description: |
 *       Endpoints de autenticación gestionados por Better Auth. Incluye:
 *       - `/api/auth/sign-in/social` - Iniciar sesión con OAuth (GitHub)
 *       - `/api/auth/callback/{provider}` - Callback de OAuth
 *       - `/api/auth/session` - Obtener sesión actual
 *       - `/api/auth/sign-out` - Cerrar sesión
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Ruta del endpoint de autenticación
 *         example: "sign-in/social"
 *     responses:
 *       200:
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       302:
 *         description: Redirección (para OAuth)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Endpoints de autenticación (Better Auth) - POST
 *     description: |
 *       Endpoints de autenticación gestionados por Better Auth. Incluye:
 *       - `/api/auth/sign-in/social` - Iniciar sesión con OAuth
 *       - `/api/auth/sign-in/email` - Iniciar sesión con email/password
 *       - `/api/auth/sign-up` - Registro de usuario
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Ruta del endpoint de autenticación
 *         example: "sign-in/social"
 *     requestBody:
 *       description: Datos de autenticación (varía según el endpoint)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           examples:
 *             signInSocial:
 *               summary: Iniciar sesión con OAuth
 *               value:
 *                 provider: "github"
 *                 callbackURL: "http://localhost:3000"
 *             signInEmail:
 *               summary: Iniciar sesión con email
 *               value:
 *                 email: "user@example.com"
 *                 password: "password123"
 *     responses:
 *       200:
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL de redirección (para OAuth)
 *                   example: "https://github.com/login/oauth/authorize?..."
 *                 session:
 *                   type: object
 *                   description: Datos de sesión
 *       302:
 *         description: Redirección (para OAuth)
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(request: NextRequest) {
  try {
    return await handler.GET(request);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/auth/{path}:
 *   post:
 *     summary: Endpoints de autenticación (Better Auth) - POST
 *     description: |
 *       Endpoints de autenticación gestionados por Better Auth. Incluye:
 *       - `/api/auth/sign-in/social` - Iniciar sesión con OAuth
 *       - `/api/auth/sign-in/email` - Iniciar sesión con email/password
 *       - `/api/auth/sign-up` - Registro de usuario
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Ruta del endpoint de autenticación
 *         example: "sign-in/social"
 *     requestBody:
 *       description: Datos de autenticación (varía según el endpoint)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           examples:
 *             signInSocial:
 *               summary: Iniciar sesión con OAuth
 *               value:
 *                 provider: "github"
 *                 callbackURL: "http://localhost:3000"
 *             signInEmail:
 *               summary: Iniciar sesión con email
 *               value:
 *                 email: "user@example.com"
 *                 password: "password123"
 *     responses:
 *       200:
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL de redirección (para OAuth)
 *                   example: "https://github.com/login/oauth/authorize?..."
 *                 session:
 *                   type: object
 *                   description: Datos de sesión
 *       302:
 *         description: Redirección (para OAuth)
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(request: NextRequest) {
  try {
    return await handler.POST(request);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
