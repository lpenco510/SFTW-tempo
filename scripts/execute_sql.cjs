/**
 * Script para ejecutar archivos SQL en Supabase utilizando el MCP
 * 
 * Uso: node scripts/execute_sql.cjs path/to/sql/file.sql
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Obtener el archivo SQL de los argumentos de línea de comandos
const sqlFilePath = process.argv[2];

if (!sqlFilePath) {
  console.error('Error: Debe proporcionar la ruta a un archivo SQL.');
  console.error('Uso: node scripts/execute_sql.cjs path/to/sql/file.sql');
  process.exit(1);
}

// Si es un flag de versión, mostrar información y salir
if (sqlFilePath === "-v" || sqlFilePath === "--version") {
  console.log("Supabase SQL Executor v1.0");
  console.log("Ejecuta archivos SQL en Supabase a través de MCP");
  process.exit(0);
}

// Si es un flag para listar tablas
if (sqlFilePath === "-l" || sqlFilePath === "--list-tables") {
  const listTablesSQL = "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_schema, table_name;";
  
  // Crear un archivo temporal para la consulta
  const tempFilePath = path.join(__dirname, `temp_list_tables_${Date.now()}.sql`);
  fs.writeFileSync(tempFilePath, listTablesSQL);
  
  try {
    // Ejecutar la consulta mediante el MCP
    const supabaseUrl = process.env.SUPABASE_URL || 'postgresql://postgres.bfzwvshxtfryawcvqwyu:MCPCursor123@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';
    const command = `npx -y @modelcontextprotocol/server-postgres@latest ${supabaseUrl} --allowExecuteSql=true --sql-file=${tempFilePath}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error listando tablas: ${error.message}`);
        process.exit(1);
      }
      
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      
      console.log(stdout);
      
      // Limpiar el archivo temporal
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    });
  } catch (error) {
    console.error("Error al listar tablas:", error);
    process.exit(1);
  }
  
  return;
}

// Verificar que el archivo existe
if (!fs.existsSync(sqlFilePath)) {
  console.error(`Error: El archivo '${sqlFilePath}' no existe.`);
  process.exit(1);
}

// Leer el contenido del archivo SQL
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Dividir el SQL en instrucciones separadas (por punto y coma seguido de nueva línea o fin de archivo)
const sqlStatements = sqlContent
  .split(/;\s*[\r\n]+/)
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0);

// Obtener las variables de entorno necesarias
const supabaseUrl = process.env.SUPABASE_URL || 'postgresql://postgres.bfzwvshxtfryawcvqwyu:MCPCursor123@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

console.log(`Ejecutando ${sqlStatements.length} instrucciones SQL desde ${sqlFilePath}`);

// Ejecutar cada instrucción SQL a través del MCP
async function executeStatements() {
  for (let i = 0; i < sqlStatements.length; i++) {
    const stmt = sqlStatements[i];
    console.log(`\nEjecutando instrucción ${i + 1}/${sqlStatements.length}:`);
    console.log(stmt.substring(0, 100) + (stmt.length > 100 ? '...' : ''));
    
    // Crear un archivo temporal para la instrucción actual
    const tempFilePath = path.join(__dirname, `temp_${Date.now()}.sql`);
    fs.writeFileSync(tempFilePath, stmt + ';');
    
    try {
      // Ejecutar el comando para enviar SQL a través del MCP
      const command = `npx -y @modelcontextprotocol/server-postgres@latest ${supabaseUrl} --allowExecuteSql=true --sql-file=${tempFilePath}`;
      
      const { stdout, stderr } = await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error ejecutando SQL: ${error.message}`);
            return reject(error);
          }
          resolve({ stdout, stderr });
        });
      });
      
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      
      console.log(stdout || "✅ Ejecutado correctamente");
      
    } catch (error) {
      console.error(`Error al ejecutar la instrucción SQL #${i + 1}:`, error);
    } finally {
      // Eliminar el archivo temporal
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }
}

executeStatements()
  .then(() => {
    console.log('\nEjecución SQL completada.');
  })
  .catch(err => {
    console.error('Error durante la ejecución:', err);
    process.exit(1);
  }); 