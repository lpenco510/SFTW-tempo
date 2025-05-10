# Correcciones de Supabase y Autenticación

Este documento detalla los cambios realizados para solucionar los problemas con la autenticación y la gestión de empresas en la aplicación IT CARGO.

## Problemas Identificados

1. **Importaciones incorrectas de useAuth**: 
   - El código importaba `useAuth` desde `@/lib/auth.ts` en lugar de `@/hooks/useAuth` donde realmente estaba definido.

2. **Inconsistencias en nombres de columnas**:
   - La tabla `companies` tiene campos duplicados: `name`/`nombre_empresa` y `tax_id`/`rut`.
   - Algunos componentes usaban un nombre de campo mientras que otros usaban el otro.

3. **Problemas con sesiones de invitado**:
   - Persistencia incorrecta del estado de invitado en localStorage cuando se intentaba cambiar a un usuario registrado.

4. **Problemas en configuración de empresa**:
   - No se estaban cargando correctamente los datos en la página de configuración.
   - Fallos al actualizar datos de empresa, especialmente logos.

## Soluciones Implementadas

### 1. Corrección de Importaciones

- Se modificaron `LoginForm.tsx` y `RegisterForm.tsx` para importar `useAuth` desde `@/hooks/useAuth`.
- Se verificó que `App.tsx` importara `AuthProvider` del lugar correcto.

### 2. Normalización de Datos de Empresa

Se crearon scripts SQL para garantizar la consistencia entre los campos duplicados:

```sql
-- Ver script completo en: supabase/fix_company_columns.sql

-- Sincronizar name y nombre_empresa
UPDATE companies 
SET nombre_empresa = name
WHERE nombre_empresa IS NULL AND name IS NOT NULL;

UPDATE companies 
SET name = nombre_empresa
WHERE name IS NULL AND nombre_empresa IS NOT NULL;

-- Sincronizar tax_id y rut
UPDATE companies 
SET tax_id = rut
WHERE tax_id IS NULL AND rut IS NOT NULL;

-- Trigger para mantener la sincronización
CREATE OR REPLACE FUNCTION sync_company_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Cuando cambia name, actualizar nombre_empresa
    IF NEW.name IS DISTINCT FROM OLD.name THEN
        NEW.nombre_empresa = NEW.name;
    END IF;
    -- ...
END;
$$ LANGUAGE plpgsql;
```

### 3. Mejoras en el Manejo de Autenticación

Se crearon herramientas para diagnosticar y corregir problemas de autenticación:

- `diagnoseAuthIssues()`: Herramienta para examinar el estado actual de autenticación.
- `resetAuth()`: Limpia todos los datos de sesión para comenzar desde cero.
- `quickFix()`: Detecta y repara automáticamente problemas comunes.

### 4. Normalización de Datos en Componentes

Se modificaron los componentes principales para aceptar diferentes formatos de datos:

- **useCompanySettings.ts**: Ahora maneja las diferentes versiones de los nombres de campos.
- **fetchCompanyById**: Normaliza los datos para que siempre tengan una estructura consistente.
- **ConfiguracionPage.tsx**: Mejorado para mostrar y actualizar correctamente los datos.

### 5. Mejoras en Políticas de Seguridad (RLS)

Se optimizaron las políticas de Row Level Security para mejorar el rendimiento:

```sql
CREATE POLICY "companies_optimized_policy" ON "companies"
AS PERMISSIVE FOR ALL
TO authenticated
USING (
    -- Verificar pertenencia a la compañía
    EXISTS (
        SELECT 1 
        FROM user_companies 
        WHERE user_companies.company_id = companies.id 
        AND user_companies.user_id = auth.uid()
    )
    -- O si el usuario es admin/propietario
    OR id IN (
        SELECT company_id 
        FROM user_companies
        WHERE user_id = auth.uid() 
        AND role IN ('ADMIN', 'OWNER', 'admin', 'owner')
    )
);
```

## Implementación de los Cambios

Para aplicar estas correcciones:

1. Ejecutar los scripts SQL en la consola de Supabase:
   - `supabase/fix_company_columns.sql` para arreglar inconsistencias entre campos
   - `supabase/db_structure_fix.sql` para mejorar la estructura general
   - `supabase/rls_optimization.sql` para optimizar las políticas de seguridad

2. Si hay problemas de autenticación persistentes:
   - Abrir la consola del navegador (F12)
   - Ejecutar `resetAuth()` para limpiar datos de sesión
   - Recargar la página e intentar iniciar sesión nuevamente

3. Para desarrollo y diagnóstico avanzado:
   - Usar `diagnoseAuthIssues()` para obtener un reporte detallado
   - Usar `quickFix()` para soluciones automáticas

## Notas Adicionales

- Se ha mejorado la robustez del sistema para manejar diferentes formatos de datos.
- Se añadieron logs extensivos para facilitar el diagnóstico de problemas futuros.
- Se corrigieron problemas de redirección después del inicio de sesión.
- La actualización de logos de empresa ahora funciona correctamente con el nuevo sistema de versioning. 