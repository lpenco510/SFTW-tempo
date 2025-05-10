// Este script prueba una consulta básica a Supabase usando el MCP
import { exec } from 'child_process';

const testQuery = `SELECT current_database(), current_user;`;
const supabaseUrl = 'postgresql://postgres.bfzwvshxtfryawcvqwyu:MCPCursor123@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

console.log('Probando conexión a Supabase...');

// Ejecutar la consulta directamente sin pasar por archivo
const command = `npx -y @modelcontextprotocol/server-postgres@latest ${supabaseUrl} --allowExecuteSql=true --sql="${testQuery}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Error al ejecutar la consulta:', error);
    process.exit(1);
  }
  
  if (stderr) {
    console.error('stderr:', stderr);
  }
  
  console.log('Resultado de la consulta:');
  console.log(stdout);
  
  // También listar las tablas de la base de datos
  const listTablesCommand = `npx -y @modelcontextprotocol/server-postgres@latest ${supabaseUrl} --allowExecuteSql=true --sql="SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_schema, table_name;"`;
  
  console.log('\nListando tablas...');
  
  exec(listTablesCommand, (error2, stdout2, stderr2) => {
    if (error2) {
      console.error('Error al listar tablas:', error2);
      process.exit(1);
    }
    
    if (stderr2) {
      console.error('stderr:', stderr2);
    }
    
    console.log('Tablas disponibles:');
    console.log(stdout2);
  });
}); 