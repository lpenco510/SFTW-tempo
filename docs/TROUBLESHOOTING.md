# Guía de Solución de Problemas - IT CARGO

## Problemas de Conexión con Supabase

Si estás experimentando problemas con la conexión a Supabase, sigue estos pasos para diagnosticar y resolver el problema:

### 1. Verificar la Conexión

Ejecuta el script de prueba de conexión:

```bash
node scripts/test_pooling.cjs
```

Este script intentará conectarse a Supabase utilizando un pool de conexiones y ejecutará algunas consultas simples. Si la conexión es exitosa, verás un mensaje confirmando que se han podido recuperar datos.

### 2. Verificar Políticas RLS

Los errores de conexión pueden deberse a políticas RLS mal configuradas. Para verificarlas:

```bash
node scripts/rls_check.cjs
```

Este script mostrará las políticas RLS que están configuradas actualmente en tu base de datos Supabase.

### 3. Corregir Problemas de Columnas

Si estás teniendo problemas con los nombres de columnas (por ejemplo, el código busca `nombre` pero la columna es `name`):

```bash
node scripts/fix_columns.cjs
```

Este script verificará las columnas en la tabla `companies` y te proporcionará recomendaciones para resolver cualquier discrepancia.

### 4. Problemas Comunes y Soluciones

#### Error: "Client has been closed and is not queryable"

Este error puede ocurrir cuando:

1. **Demasiadas conexiones simultáneas**: 
   - Verifica que el pool de conexiones esté configurado correctamente en `src/lib/supabase.ts`
   - Ajusta el tamaño del pool en `.cursor/mcp.json`

2. **Tiempo de conexión agotado**:
   - Verifica que el timeout sea suficiente en `.cursor/mcp.json`

3. **Políticas RLS ineficientes**:
   - Las políticas que usan `auth.uid()` en cada fila pueden ser ineficientes
   - Considera implementar las optimizaciones en `supabase/rls_optimization.sql`

#### Error: No se muestran los datos de empresas correctamente

1. **Problema de nombres de columnas**:
   - El código busca `nombre` pero la columna es `name` o `nombre_empresa`
   - La solución ya está implementada en `src/lib/supabase.ts` con la función `fetchCompanyById`

2. **Usuario invitado no detectado**:
   - Verifica que `isGuestUser()` funcione correctamente en `src/lib/auth.ts`

#### Error: La imagen de logo no se actualiza

1. **Problema de caché**:
   - Se ha implementado un sistema de versiones con `logoVersion`
   - Asegúrate de que la URL incluya el parámetro `?v=${timestamp}`

2. **Problema de sincronización**:
   - Verifica que se emita el evento `company-updated` después de actualizar el logo
   - Confirma que Sidebar esté escuchando el evento

### 5. Monitoreo de Conexión

La aplicación ahora incluye un monitor de conexión que puedes ver en la esquina inferior derecha. Este monitor:

1. Verifica periódicamente la conexión a Supabase
2. Muestra el estado actual de la conexión
3. Permite reintentar la conexión manualmente

### 6. Ajustes del Archivo .cursor/mcp.json

Si sigues teniendo problemas, puedes ajustar los parámetros en el archivo `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@modelcontextprotocol/server-postgres@latest",
        "postgresql://postgres.bfzwvshxtfryawcvqwyu:MCPCursor123@aws-0-sa-east-1.pooler.supabase.com:5432/postgres",
        "--poolSize=10",
        "--timeout=30000",
        "--allowExecuteSql=true",
        "--keepAlive=true",
        "--debug=true",
        "--verbose=true"
      ]
    }
  }
}
```

Parámetros que puedes ajustar:
- `--poolSize`: Número máximo de conexiones (5-20)
- `--timeout`: Tiempo máximo para cada operación en milisegundos (10000-60000)
- `--keepAlive`: Mantener la conexión activa
- `--debug`: Mostrar información de depuración
- `--verbose`: Mostrar información detallada

### 7. Contacto de Soporte

Si después de seguir estos pasos sigues teniendo problemas, contacta al equipo de soporte:

- Email: soporte@itcargo.com
- Teléfono: +54 11 5555-5555 