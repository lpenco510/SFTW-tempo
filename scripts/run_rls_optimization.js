/**
 * Script para ejecutar el archivo de optimización RLS en Supabase
 * Este script automatiza la ejecución de rls_optimization.sql
 */

const path = require('path');
const { exec } = require('child_process');

const RLS_SQL_PATH = path.resolve(__dirname, '../supabase/rls_optimization.sql');

console.log(`Ejecutando optimización RLS desde ${RLS_SQL_PATH}`);
console.log('Este proceso puede tardar varios minutos...');

// Ejecutar el script de ejecución SQL con el archivo de optimización RLS
const command = `node ${path.join(__dirname, 'execute_sql.js')} ${RLS_SQL_PATH}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error ejecutando optimización RLS: ${error.message}`);
    process.exit(1);
  }
  
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
  
  console.log(stdout);
  console.log('\nOptimización RLS completada con éxito.');
}); 