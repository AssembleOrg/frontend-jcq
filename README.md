# JCQ Andamios - Sistema de Gestión de Proyectos

Sistema web completo para la gestión de proyectos de construcción, clientes y pagos de JCQ Andamios.

## 🚀 Características

- ✅ **Autenticación JWT** con gestión de roles (ADMIN, SUBADMIN, MANAGER)
- 📊 **Dashboard** con métricas en tiempo real
- 🏗️ **Gestión de Proyectos** con estados (Presupuesto, Activo, En Proceso, Finalizado)
- 💰 **Control de Pagos** integrado con proyectos
- 👥 **Gestión de Clientes** con CUIT/DNI
- 👤 **Administración de Usuarios** (solo ADMIN/SUBADMIN)
- 🎨 **Diseño moderno** con colores de marca JCQ (naranja/negro)
- ⚡ **Rendimiento optimizado** con React 19 y Next.js 16
- 🔒 **Seguridad** con proxy API y tokens protegidos

## 🏗️ Arquitectura

### Clean Architecture

```
src/
├── core/                    # Capa de dominio
│   ├── entities/           # Modelos e interfaces
│   └── usecases/           # Lógica de negocio (futuro)
├── infrastructure/         # Capa de infraestructura
│   ├── api/               # Cliente HTTP y endpoints
│   └── storage/           # LocalStorage/SessionStorage
└── presentation/          # Capa de presentación
    ├── components/        # Componentes React
    ├── hooks/            # Custom hooks
    ├── stores/           # Zustand stores
    └── utils/            # Utilidades
```

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TailwindCSS 4
- **Estado**: Zustand con prevención de race conditions
- **HTTP**: Axios con interceptores
- **Formularios**: React Hook Form + Zod
- **Íconos**: Lucide React
- **Fechas**: date-fns
- **Estilos**: Class Variance Authority + Tailwind Merge

## 📦 Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd frontend-jcq

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local

# Editar .env.local con la URL del backend
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Ejecutar en desarrollo
pnpm dev
```

## 🔧 Configuración

### Variables de Entorno

```env
# Backend API URL (desarrollo)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Backend API URL (producción)
# NEXT_PUBLIC_BASE_URL=https://tu-backend-en-railway.app
```

### Proxy API

El proxy está configurado en `next.config.ts` para evitar CORS y ocultar la URL del backend:

```typescript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: `${backendUrl}/api/:path*`,
    },
  ];
}
```

## 📱 Estructura de Rutas

```
/                           → Redirect a /login o /dashboard
/login                      → Página de inicio de sesión
/dashboard                  → Dashboard principal
/dashboard/projects         → Gestión de proyectos
/dashboard/clients          → Gestión de clientes
/dashboard/users            → Gestión de usuarios (ADMIN/SUBADMIN)
```

## 🎨 Componentes Principales

### UI Components

- `Button` - Botones con variantes y estados de carga
- `Input` - Campos de entrada con validación
- `Select` - Selectores personalizados
- `Card` - Tarjetas de contenido
- `Modal` - Modales reutilizables
- `Badge` - Etiquetas de estado
- `Loader` - Indicadores de carga

### Feature Components

- `ProjectCard` - Tarjeta de proyecto con progreso
- `ProjectForm` - Formulario de creación/edición
- `PaymentsModal` - Gestión de pagos por proyecto
- `ClientForm` - Formulario de clientes
- `UserForm` - Formulario de usuarios
- `Sidebar` - Navegación lateral
- `Header` - Encabezado de páginas

## 🔐 Gestión de Estado

### Zustand Stores

Todos los stores implementan prevención de race conditions:

```typescript
// Ejemplo de uso
const { projects, fetchProjects, createProject } = useProjectsStore();

// Fetch con filtros
await fetchProjects({ status: "ACTIVE", page: 1, limit: 10 });

// Crear proyecto
const newProject = await createProject(projectData);
```

### Stores Disponibles

- `useAuthStore` - Autenticación y usuario actual
- `useProjectsStore` - Proyectos/Presupuestos
- `usePaidsStore` - Pagos
- `useClientsStore` - Clientes
- `useUsersStore` - Usuarios (ADMIN)

## 🎨 Theming

Los colores de marca JCQ están configurados en `globals.css`:

```css
--brand-orange: #ff6b35; /* Naranja principal */
--brand-orange-light: #ff8c61; /* Naranja claro */
--brand-orange-dark: #e55425; /* Naranja oscuro */
--brand-black: #1a1a1a; /* Negro principal */
--brand-gray: #2d2d2d; /* Gris oscuro */
```

## 📊 Características Principales

### Dashboard

- Resumen de proyectos activos
- Total de clientes
- Métricas financieras (cobrado/pendiente)
- Últimos proyectos

### Proyectos

- CRUD completo
- Estados: BUDGET → ACTIVE → IN_PROCESS → FINISHED
- Barra de progreso de pagos
- Filtros por estado y búsqueda
- Integración con clientes

### Pagos

- Modal integrado en proyectos
- Validación de montos vs. saldo pendiente
- Historial de pagos
- Números de factura opcionales
- Actualización automática de totales

### Clientes

- Gestión de CUIT/DNI
- Búsqueda por múltiples campos
- Validación de datos únicos

### Usuarios

- Roles: ADMIN, SUBADMIN, MANAGER
- Acceso restringido por rol
- Estado activo/inactivo
- Gestión de permisos

## 🚀 Comandos

```bash
# Desarrollo
pnpm dev           # Iniciar servidor de desarrollo

# Producción
pnpm build         # Construir para producción
pnpm start         # Iniciar servidor de producción

# Linting
pnpm lint          # Ejecutar ESLint
```

## 📝 Convenciones de Código

- Usar **path aliases** (@/ y ~/) [[memory:8147798]]
- Imports organizados con barrel files
- Componentes con TypeScript estricto
- Usar class-variance-authority para componentes variantes
- Formato de fechas con date-fns
- Moneda en formato ARS

## 🔒 Seguridad

- Tokens JWT almacenados en localStorage
- Interceptores para renovación automática
- Redirección a login en 401
- Validación de roles en frontend
- Proxy API para ocultar backend URL

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Navegación adaptativa
- Cards responsivos
- Modales adaptados a móvil

## 🐛 Solución de Problemas

### Error: Cannot find module '@/...'

Asegúrate de tener configurado tsconfig.json correctamente con los paths.

### Error: 401 Unauthorized

Verifica que el token JWT sea válido y que el backend esté corriendo.

### Error: Cannot connect to backend

Verifica NEXT_PUBLIC_BASE_URL en .env.local y que el backend esté activo.

### Estilos no se cargan

Ejecuta `pnpm dev` de nuevo para regenerar los estilos de Tailwind.

## 📄 Licencia

© 2025 JCQ Andamios. Todos los derechos reservados.

## 👨‍💻 Desarrollo

Desarrollado para JCQ Andamios siguiendo clean architecture y mejores prácticas de Next.js.

---

**Nota**: Este proyecto está configurado para usar **pnpm** como gestor de paquetes [[memory:8147796]].
