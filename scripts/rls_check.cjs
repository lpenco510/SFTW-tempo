/**
 * Script para verificar las políticas RLS en Supabase
 * Ejecutar con: node scripts/rls_check.cjs
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// URL de conexión a Supabase
const supabaseUrl = 'postgresql://postgres.bfzwvshxtfryawcvqwyu:MCPCursor123@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

// Consulta SQL para verificar las políticas RLS
const rlsQuery = `
-- Consulta para verificar políticas RLS
SELECT n.nspname as schema,
       c.relname as table_name,
       CASE WHEN c.relrowsecurity THEN 'enabled' ELSE 'disabled' END as rls_enabled,
       pol.polname as policy_name,
       pol.polcmd as policy_command,
       pol.polpermissive as policy_permissive,
       pg_get_expr(pol.polqual, pol.polrelid) as policy_expression
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policy pol ON c.oid = pol.polrelid
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY schema, table_name, policy_name;
`;

// Crear un archivo temporal para la consulta
const tempFile = path.join(__dirname, `temp_rls_${Date.now()}.sql`);
fs.writeFileSync(tempFile, rlsQuery);

console.log('Verificando políticas RLS en Supabase...');

// Ejecutar la consulta
const command = `npx -y @modelcontextprotocol/server-postgres@latest ${supabaseUrl} --sql-file=${tempFile}`;

exec(command, (error, stdout, stderr) => {
  try {
    // Limpiar el archivo temporal siempre
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    
    if (error) {
      console.error('Error al verificar políticas RLS:', error.message);
      console.error(stderr);
      process.exit(1);
    }
    
    if (stderr) {
      console.warn('Advertencias:', stderr);
    }
    
    console.log('Políticas RLS en la base de datos:');
    console.log(stdout);
    
    // Si no hay resultados, consultar a las tablas para ver si existen
    if (!stdout || stdout.trim() === '') {
      console.log('\nNo se encontraron políticas RLS. Verificando tablas...');
      
      const tablesQuery = `
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_schema, table_name;
      `;
      
      const tempTablesFile = path.join(__dirname, `temp_tables_${Date.now()}.sql`);
      fs.writeFileSync(tempTablesFile, tablesQuery);
      
      const tablesCommand = `npx -y @modelcontextprotocol/server-postgres@latest ${supabaseUrl} --sql-file=${tempTablesFile}`;
      
      exec(tablesCommand, (error2, stdout2, stderr2) => {
        if (fs.existsSync(tempTablesFile)) {
          fs.unlinkSync(tempTablesFile);
        }
        
        if (error2) {
          console.error('Error al listar tablas:', error2.message);
          process.exit(1);
        }
        
        console.log('Tablas en la base de datos:');
        console.log(stdout2);
        
        // Sugerir crear políticas RLS optimizadas
        console.log('\nRecomendación: Crea políticas RLS optimizadas utilizando la función get_auth_uid() para mejorar el rendimiento.');
        console.log('Consulta el archivo supabase/rls_optimization.sql para ver ejemplos de políticas optimizadas.');
      });
    }
  } catch (err) {
    console.error('Error inesperado:', err);
    process.exit(1);
  }
}); 