# PrevalentWare - Sistema de Gestión de Ingresos y Gastos

Aplicación fullstack construida con Next.js 16 (App Router), TypeScript, Prisma y Better Auth que permite gestionar ingresos, egresos, usuarios y generar reportes financieros con control de acceso basado en roles (RBAC).

## 📋 Estructura General

```
/app
  api/                    -> Route Handlers (Next.js API Routes)
    auth/                 -> Endpoints de autenticación (Better Auth)
    docs/                 -> Documentación Swagger/OpenAPI
    movimientos/          -> CRUD de movimientos financieros
    usuarios/             -> Gestión de usuarios (ADMIN only)
    reportes/             -> Reportes y exportación CSV
  login/                  -> Página de autenticación
  movimientos/            -> Vista de ingresos y egresos
  usuarios/               -> Vista de gestión de usuarios
  reportes/               -> Vista de reportes financieros

/components
  ui/                     -> Componentes UI reutilizables (shadcn/ui)
  Sidebar.tsx             -> Navegación lateral izquierda
  PageLayout.tsx           -> Layout wrapper para páginas protegidas

/features                 -> Arquitectura feature-based
  auth/                   -> Autenticación y autorización
    services/             -> Lógica de autenticación
    hooks/                -> useAuth, useSession, useUser
    guards/               -> withAuth, withRole, apiGuard
    components/           -> LoginForm, RegisterForm, GitHubAuthButton
  movimientos/            -> Gestión de ingresos y egresos
    components/           -> MovementsTable, CreateMovementModal
    hooks/                -> useMovements, useCreateMovement
    services/             -> MovementService
    validators/           -> Schemas Zod
  usuarios/               -> Gestión de usuarios (ADMIN)
    components/           -> UsersTable, EditUserModal
    hooks/                -> useUsers, useUpdateUser
    services/             -> UserService
    validators/           -> Schemas Zod
  reportes/               -> Reportes financieros (ADMIN)
    components/           -> MovementsChart, BalanceKPI, DownloadCSVButton
    hooks/                -> useReports, useDownloadCSV
    services/             -> ReportService
    validators/           -> Schemas Zod

/lib
  auth.ts                 -> Configuración Better Auth
  prisma.ts               -> Cliente Prisma (singleton)
  rbac.ts                 -> Sistema de roles y permisos
  swagger.ts              -> Configuración OpenAPI/Swagger
  utils.ts                -> Utilidades generales

/schemas                  -> Schemas de validación compartidos
  common/                 -> Paginación, fechas, IDs, errores
  entities/               -> User, Movement
  api/                    -> Queries compuestas

/stores                   -> Estado global (Zustand)
  auth.store.ts           -> Store de autenticación/sesión

/prisma
  schema.prisma           -> Schema de base de datos

/tests                    -> Tests unitarios (Vitest)
```

## 🔧 Requisitos

- **Node.js** >= 18
- **npm** >= 9 (o **pnpm** >= 8)
- **PostgreSQL** (Supabase recomendado)
- **Git**

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/yamirkamell/app-prevalentWare-test.git
cd app-prevalentWare-test
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public&sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="tu-secret-key-aqui-minimo-32-caracteres"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# GitHub OAuth (opcional)
GITHUB_CLIENT_ID="tu-client-id"
GITHUB_CLIENT_SECRET="tu-client-secret"

# Supabase (opcional, si usas otras features)
NEXT_PUBLIC_SUPABASE_URL="tu-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-supabase-anon-key"

# Entorno
NODE_ENV="development"
```

### 4. Configurar base de datos

```bash
# Generar cliente Prisma
npm run db:generate

# Sincronizar schema con la base de datos
npm run db:push
```

**Nota:** Si usas Supabase, ejecuta el SQL del schema manualmente en el SQL Editor de Supabase si `db:push` falla por problemas de conexión SSL.

### 5. Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📚 Patrones de Diseño Aplicados

### Feature-based Architecture
Organización del código por características en lugar de por capas. Cada feature agrupa componentes, hooks, servicios, validators y tipos relacionados, mejorando la escalabilidad y mantenibilidad.

### Repository Pattern (implícito)
Prisma actúa como repositorio, encapsulando el acceso a la base de datos y aislando los servicios de los detalles de persistencia.

### Schema Composition
Schemas de validación (Zod) compartidos en `/schemas` que se componen y extienden en cada feature, siguiendo el principio DRY.

### RBAC (Role-Based Access Control)
Sistema de control de acceso basado en roles con guards (`withAuth`, `withRole`, `apiGuard`) que protegen rutas y endpoints según el rol del usuario.

### State Management con Zustand
Store centralizado solo para autenticación/sesión. Las features mantienen su estado local de forma independiente.

### Higher-Order Components (HOCs)
`withAuth` y `withRole` protegen páginas del lado del cliente, redirigiendo usuarios no autenticados o sin permisos.

## 🛠️ Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo (Next.js) |
| `npm run build` | Construye la aplicación para producción |
| `npm run start` | Inicia servidor de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run test` | Ejecuta tests unitarios (Vitest) |
| `npm run test:ui` | Ejecuta tests con UI interactiva |
| `npm run test:coverage` | Ejecuta tests con cobertura |
| `npm run db:generate` | Genera cliente Prisma |
| `npm run db:push` | Sincroniza schema con BD (sin migraciones) |
| `npm run db:migrate` | Crea y aplica migraciones |
| `npm run db:studio` | Abre Prisma Studio (GUI para BD) |

## 🧪 Testing

### Ejecutar tests

```bash
# Todos los tests
npm run test

# Con UI interactiva
npm run test:ui

# Con cobertura
npm run test:coverage
```

### Estructura de tests

```
/tests
  features/
    movimientos/validators/  -> Tests de validadores
    usuarios/validators/     -> Tests de validadores
  lib/
    rbac.test.ts             -> Tests de RBAC
```

## 📖 Documentación API

La documentación Swagger/OpenAPI está disponible en:

```
http://localhost:3000/api/docs
```

Incluye:
- Endpoints de autenticación
- CRUD de movimientos
- Gestión de usuarios
- Reportes y exportación CSV

Cada endpoint está documentado con:
- Parámetros requeridos y opcionales
- Ejemplos de request/response
- Códigos de estado HTTP
- Esquemas de validación

## 🚢 Despliegue en Vercel

### 1. Preparar el proyecto

```bash
# Asegúrate de que el build funciona
npm run build
```

### 2. Conectar con Vercel

1. Instala Vercel CLI (opcional):
   ```bash
   npm i -g vercel
   ```

2. Inicia sesión:
   ```bash
   vercel login
   ```

3. Despliega:
   ```bash
   vercel
   ```

### 3. Configurar variables de entorno en Vercel

En el dashboard de Vercel, ve a **Settings > Environment Variables** y agrega:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a PostgreSQL (Supabase) | `postgresql://...` |
| `BETTER_AUTH_SECRET` | Secret key para Better Auth (mínimo 32 caracteres) | Genera con `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | URL pública de tu app | `https://tu-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | URL pública de tu app | `https://tu-app.vercel.app` |
| `GITHUB_CLIENT_ID` | Client ID de GitHub OAuth (opcional) | `Ov23li...` |
| `GITHUB_CLIENT_SECRET` | Client Secret de GitHub OAuth (opcional) | `tu-secret` |
| `NODE_ENV` | Entorno | `production` |

### 4. Configurar GitHub OAuth (si aplica)

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Crea una nueva OAuth App
3. **Authorization callback URL**: `https://tu-app.vercel.app/api/auth/callback/github`
4. Copia el Client ID y Client Secret a Vercel

### 5. Configurar base de datos en producción

Asegúrate de que:
- Tu base de datos PostgreSQL (Supabase) esté accesible desde internet
- El `DATABASE_URL` en Vercel use SSL (`?sslmode=require`)
- Las tablas necesarias estén creadas (ejecuta `npm run db:push` localmente o SQL manualmente)

### 6. Desplegar

```bash
# Despliegue de producción
vercel --prod
```

O usa el flujo de GitHub:
1. Conecta tu repositorio en Vercel
2. Cada push a `main` desplegará automáticamente

## 🔐 Roles y Permisos

### Usuario (USER)
- ✅ Ver y crear sus propios movimientos
- ❌ Ver reportes
- ❌ Gestionar usuarios

### Administrador (ADMIN)
- ✅ Ver y crear movimientos (propios y de otros usuarios)
- ✅ Ver reportes y descargar CSV
- ✅ Gestionar usuarios (editar nombre y rol)

**Nota:** Todos los nuevos usuarios se asignan automáticamente con rol ADMIN para facilitar las pruebas.

## 🏗️ Arquitectura Técnica

### Frontend
- **Next.js 16** con App Router
- **React 19** con Server Components
- **TypeScript** para type-safety
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes UI
- **Zustand** para estado global (solo auth)
- **Recharts** para gráficos
- **react-icons** para iconografía

### Backend
- **Next.js API Routes** (Route Handlers)
- **Prisma** como ORM
- **PostgreSQL** (Supabase) como base de datos
- **Better Auth** para autenticación
- **Zod** para validación de schemas
- **Swagger/OpenAPI** para documentación

### Seguridad
- **RBAC** (Role-Based Access Control)
- **Guards** en rutas y APIs
- **Validación** con Zod en todos los endpoints
- **Type-safety** end-to-end con TypeScript

## 📝 Estructura de Features

Cada feature sigue esta estructura:

```
features/[feature]/
  components/     -> Componentes React
  hooks/          -> Custom hooks
  pages/          -> Páginas (NO rutas Next.js)
  services/       -> Llamadas a API
  types/          -> Tipos TypeScript
  validators/     -> Schemas Zod
  index.ts        -> Exportaciones públicas
```

## 🔍 Linting y Formateo

```bash
# Linting
npm run lint

# El proyecto usa ESLint con configuración Next.js
```

## 📦 Dependencias Principales

### Producción
- `next` - Framework React
- `react` / `react-dom` - Biblioteca UI
- `@prisma/client` - ORM
- `better-auth` - Autenticación
- `zod` - Validación de schemas
- `zustand` - State management
- `recharts` - Gráficos
- `papaparse` - Generación CSV
- `swagger-jsdoc` / `swagger-ui-react` - Documentación API

### Desarrollo
- `typescript` - Type checking
- `vitest` - Testing framework
- `@testing-library/react` - Testing utilities
- `tailwindcss` - CSS framework
- `eslint` - Linter

## 🐛 Troubleshooting

### Error de conexión a base de datos
- Verifica que `DATABASE_URL` esté correctamente configurado
- Si usas Supabase, asegúrate de incluir `?sslmode=require` en la URL
- Verifica que la base de datos esté accesible desde tu IP

### Error "Model does not exist"
- Ejecuta `npm run db:push` para sincronizar el schema
- O ejecuta el SQL manualmente en Supabase SQL Editor

### Error de autenticación
- Verifica que `BETTER_AUTH_SECRET` tenga al menos 32 caracteres
- Asegúrate de que `BETTER_AUTH_URL` coincida con tu URL actual

### Build falla en Vercel
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs de build en Vercel
- Asegúrate de que `DATABASE_URL` use SSL en producción

## 📄 Licencia

ISC

## 👤 Autor

Yamir Kamell

## 🔗 Enlaces

- [Repositorio](https://github.com/yamirkamell/app-prevalentWare-test)
- [Documentación Next.js](https://nextjs.org/docs)
- [Documentación Prisma](https://www.prisma.io/docs)
- [Documentación Better Auth](https://www.better-auth.com/docs)
