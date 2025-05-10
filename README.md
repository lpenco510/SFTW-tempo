# IT CARGO - Sistema de Gestión de Comercio Exterior

## Visión General
IT CARGO es una plataforma integral diseñada específicamente para la gestión de operaciones de comercio exterior desde Argentina. El sistema facilita todos los procesos relacionados con importaciones, exportaciones, logística internacional, documentación aduanera y seguimiento de envíos, brindando una solución completa para empresas que operan en el mercado global.

## Stack Tecnológico
- **Frontend**: React 18 con TypeScript
- **UI Framework**: TailwindCSS con Radix UI y shadcn/ui
- **State Management**: React Context y hooks personalizados
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth
- **Almacenamiento**: Supabase Storage para documentos
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Validación de Formularios**: React Hook Form con Zod
- **Animaciones**: Framer Motion
- **Visualización de Datos**: Recharts

## Funcionalidades Principales

### Operaciones de Comercio Exterior
- Gestión completa de importaciones y exportaciones
- Seguimiento de estados aduaneros en tiempo real
- Control de documentación requerida (despachos, facturas, etc.)
- Integración con normativas argentinas (AFIP, Aduana)
- Cálculo automático de aranceles e impuestos

### Dashboard Interactivo
- Visualización de métricas clave del negocio
- Análisis de tendencias en operaciones internacionales
- Distribución geográfica de importaciones/exportaciones
- Monitoreo de estados de trámites aduaneros
- Alertas sobre documentación pendiente o vencimientos

### Gestión Documental
- Almacenamiento digital de toda la documentación requerida
- Sistema de versionado para despachos y formularios oficiales
- Validación de documentos según requisitos legales argentinos
- Firma digital de documentos (integración potencial)
- Historial completo de cambios en documentación

### Logística y Tracking
- Seguimiento en tiempo real de envíos internacionales
- Integración con transportistas y agentes de carga
- Gestión de costos logísticos y optimización de rutas
- Alertas por demoras o problemas en envíos
- Visualización de estado de mercadería en tránsito

### Gestión Financiera
- Control de pagos internacionales y liquidación de divisas
- Seguimiento de regímenes cambiarios aplicables
- Gestión de instrumentos financieros (cartas de crédito, etc.)
- Control de costos por operación
- Histórico de operaciones financieras

### Sistema de Usuarios y Permisos
- Roles específicos para comercio exterior (despachante, trader, etc.)
- Permisos granulares sobre documentos y operaciones
- Colaboración entre diferentes participantes del proceso
- Auditoría completa de acciones realizadas en el sistema

## Configuración del Entorno

### Variables de Entorno

La aplicación requiere las siguientes variables de entorno para funcionar correctamente:

1. Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
```

⚠️ **IMPORTANTE**: 
- **NUNCA** incluyas este archivo en el control de versiones
- Estas claves deben ser proporcionadas por el administrador del proyecto
- Después de cambiar las variables, **reinicia el servidor de desarrollo**

### Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

# Resolución de Problemas

## Problemas de Autenticación

1. **Pantalla "Verificando acceso" infinita**:
   - Verifica que el archivo `.env.local` existe y contiene las variables correctas
   - Limpia la caché del navegador y localStorage
   - Revisa la consola del navegador para mensajes de error específicos

2. **Error en modo invitado**:
   - El modo invitado solo funciona en entorno de desarrollo
   - Asegúrate de ingresar un nombre de empresa válido
   - Verifica que localStorage esté habilitado en tu navegador

3. **Errores de conexión con Supabase**:
   - Comprueba tu conexión a internet
   - Verifica que las claves de Supabase son correctas
   - Asegúrate de que el proyecto de Supabase está activo

## Recomendaciones de Seguridad

- No almacenes información sensible en localStorage sin cifrar
- Evita exponer las claves de API en el código cliente
- Sigue las políticas de seguridad definidas en `CODING_STANDARDS.md`

Para más información sobre los estándares de código y seguridad, consulta el archivo `CODING_STANDARDS.md`.

## Estructura del Proyecto
```
src/
├── components/       # Componentes de UI reutilizables
│   ├── ui/           # Componentes base (shadcn/ui)
│   ├── auth/         # Componentes de autenticación
│   ├── dashboard/    # Componentes del dashboard
│   └── [feature]/    # Componentes específicos por característica
├── lib/              # Utilidades y servicios
│   ├── supabase.ts   # Cliente y helpers de Supabase
│   └── auth.ts       # Funciones de autenticación
├── hooks/            # Custom hooks de React
├── types/            # Definiciones de TypeScript
└── stories/          # Documentación de componentes
```

## Base de Datos
El esquema de la base de datos incluye tablas específicas para comercio exterior:
- `companies`: Información de empresas y clientes
- `profiles`: Perfiles de usuarios del sistema
- `shipments`: Registro de operaciones de importación/exportación
- `customs_events`: Eventos aduaneros relacionados a envíos
- `documents`: Documentación requerida para operaciones
- `audit_logs`: Registro de auditoría para cumplimiento normativo

## Optimizaciones
- Búsqueda de texto completo para documentos aduaneros
- Políticas RLS optimizadas para consultas de alto rendimiento
- Función `get_auth_uid()` para optimizar políticas de seguridad
- Índices específicos para mejora de rendimiento en consultas frecuentes
- Sistema de auditoría para cumplimiento de normas regulatorias

## Seguridad
- Políticas RLS (Row Level Security) para restricción de datos
- Verificación de pertenencia a empresa antes de permitir acceso
- Funciones de auditoría para operaciones críticas
- Separación de permisos por tipo de operación y rol

## Roadmap
- Integración con APIs de AFIP/Aduana Argentina
- Sistema de notificaciones en tiempo real
- Digitalización de trámites aduaneros
- Chatbot especializado en normativa de comercio exterior
- Módulo de facturación electrónica internacional
- Soporte para regímenes especiales (zonas francas, etc.)

## Licenciamiento
Este software es propiedad de IT CARGO y su uso está restringido según los términos del acuerdo de licencia.

# SFTW-IT Management System

A modern management system for businesses.

## ⚠️ IMPORTANT PRODUCTION SECURITY NOTICE

**CRITICAL**: Before deploying to production, ensure you **REMOVE** the diagnostic tools:

1. In `src/App.tsx`, remove or comment out the following lines:
   ```jsx
   // Show diagnostic component in development mode if environment variables are missing
   if (import.meta.env.DEV && envMissing) {
     return <EnvDiagnostics />;
   }
   ```

2. Remove or ensure the `EnvDiagnostics` component import is removed in production builds.

3. These diagnostic tools are for development only and represent a security risk in production.

## Environment Setup

This application requires environment variables to be properly configured in order to function correctly. You need to set up the following:

### Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development Mode Features

In development mode, the application includes:

1. **Emergency Diagnostics Tool**: Automatically appears when environment variables are missing, allowing you to:
   - View status of environment configuration
   - Manually set environment variables for the current session
   - Get troubleshooting guidance

2. **Manual Environment Variable Management**:
   - You can use the `window.envLoader` object in the browser console with these methods:
     - `check()`: Check current environment variables
     - `load({ VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY })`: Load variables manually
     - `clear()`: Clear manual variables

## Getting Started

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Set up the environment variables as described above
4. Start the development server
   ```
   npm run dev
   ```

## Troubleshooting

### Application Shows Emergency Diagnostic Tool

If you see the emergency diagnostic tool screen:

1. Verify you have a `.env.local` file in the project root
2. Check that both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correctly set
3. Restart the development server after modifying the `.env.local` file

### Guest Mode Issues

Guest mode is intended for development and testing only. To use guest mode:

1. Make sure you're in development mode
2. Use the guest login option on the login page
3. Note that some features (like saving settings) are not available in guest mode

## Production Deployment

Before deploying to production:

1. Ensure all environment variables are properly set in your production environment
2. The diagnostic tools are automatically disabled in production
3. Guest mode is restricted in production environments for security

---

## About

This application is built with:

- React
- TypeScript
- Supabase (for authentication and database)
- Vite (for build and development) 
Before deploying to production:

1. Ensure all environment variables are properly set in your production environment
2. The diagnostic tools are automatically disabled in production
3. Guest mode is restricted in production environments for security

---

## About

This application is built with:

- React
- TypeScript
- Supabase (for authentication and database)
- Vite (for build and development) 