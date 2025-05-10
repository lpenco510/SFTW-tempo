/**
 * Script para probar la conexión con Supabase
 * Ejecutar con: node scripts/test_db.cjs
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// URL de conexión a Supabase
const supabaseUrl = 'postgresql://postgres.bfzwvshxtfryawcvqwyu:MCPCursor123@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

// Consulta SQL para obtener información básica
const testQuery = `
SELECT current_database() as db_name, 
       current_user as current_user,
       current_timestamp as server_time;
`;

// Crear un archivo temporal para la consulta
const tempFile = path.join(__dirname, `temp_test_${Date.now()}.sql`);
fs.writeFileSync(tempFile, testQuery);

console.log('Probando conexión a Supabase...');

// Ejecutar la consulta
const command = `npx -y @modelcontextprotocol/server-postgres@latest ${supabaseUrl} --sql-file=${tempFile}`;

exec(command, (error, stdout, stderr) => {
  try {
    // Limpiar el archivo temporal siempre
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    
    if (error) {
      console.error('Error al conectar con Supabase:', error.message);
      console.error(stderr);
      process.exit(1);
    }
    
    if (stderr) {
      console.warn('Advertencias:', stderr);
    }
    
    console.log('Conexión exitosa a Supabase:');
    console.log(stdout);
    
    // Probar también a obtener las tablas
    const listTablesQuery = `
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_schema, table_name;
    `;
    
    const tempTablesFile = path.join(__dirname, `temp_tables_${Date.now()}.sql`);
    fs.writeFileSync(tempTablesFile, listTablesQuery);
    
    console.log('\nListando tablas de la base de datos...');
    
    const tablesCommand = `npx -y @modelcontextprotocol/server-postgres@latest ${supabaseUrl} --sql-file=${tempTablesFile}`;
    
    exec(tablesCommand, (error2, stdout2, stderr2) => {
      // Limpiar el segundo archivo temporal
      if (fs.existsSync(tempTablesFile)) {
        fs.unlinkSync(tempTablesFile);
      }
      
      if (error2) {
        console.error('Error al listar tablas:', error2.message);
        console.error(stderr2);
        process.exit(1);
      }
      
      console.log('Tablas en la base de datos:');
      console.log(stdout2);
    });
    
  } catch (err) {
    console.error('Error inesperado:', err);
    process.exit(1);
  }
}); 