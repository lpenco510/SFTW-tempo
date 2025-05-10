# Solución al problema de autenticación

Este documento explica cómo resolver el error `SyntaxError: The requested module '/src/lib/auth.ts' does not provide an export named 'useAuth'` y otros problemas relacionados con la autenticación.

## Cambios realizados

1. **Corrección de importaciones**:
   - Se modificó `LoginForm.tsx` y `RegisterForm.tsx` para importar `useAuth` desde `@/hooks/useAuth` en lugar de `@/lib/auth`.
   - Se aseguró que `App.tsx` importa `AuthProvider` desde `hooks/useAuth` y no desde `lib/auth`.

2. **Coherencia en base de datos**:
   - Se creó el script `supabase/db_structure_fix.sql` para:
     - Sincronizar campos duplicados (`name`/`nombre_empresa` y `tax_id`/`rut`)
     - Crear un trigger que mantiene sincronizados estos campos
     - Optimizar políticas RLS con la función `get_auth_uid()`
     - Ajustar tipos de datos y formatos en `user_companies`

3. **Herramientas de diagnóstico**:
   - Se creó `src/lib/resetAuthTools.js` con funciones para:
     - Diagnosticar problemas de autenticación (`diagnoseAuthIssues()`)
     - Limpiar datos de sesión corruptos (`resetAuth()`)
     - Arreglar automáticamente problemas comunes (`quickFix()`)
   - Se modificó `main.tsx` para cargar estas herramientas en desarrollo

## Pasos para aplicar la solución

1. **Ejecutar los scripts SQL**:
   - Primero ejecuta `supabase/db_structure_fix.sql` en la consola SQL de Supabase
   - Luego ejecuta `supabase/rls_optimization.sql` para optimizar las políticas RLS

2. **Reiniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Limpiar el estado de autenticación**:
   - Abre la consola del navegador (F12)
   - Ejecuta `resetAuth()` para limpiar todos los datos de sesión
   - Recarga la página

4. **Si persisten los problemas**:
   - Ejecuta `diagnoseAuthIssues()` para obtener información detallada
   - Intenta `quickFix()` para una reparación automática
   - Si aún hay problemas, prueba a navegar en modo incógnito

## Verificar el éxito de la solución

1. Inicia sesión con un usuario existente
2. Verifica que puedas navegar por todas las secciones protegidas
3. Cierra sesión y comprueba que te redirecciona a la pantalla de login
4. Intenta crear un nuevo usuario para verificar que el flujo completo funcione

Si encontraras algún otro problema, consulta `docs/TROUBLESHOOTING.md` para más soluciones. 