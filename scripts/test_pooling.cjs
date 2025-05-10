/**
 * Script para probar conexiones pool con Postgres/Supabase
 * Ejecutar con: node scripts/test_pooling.cjs
 */

const { Pool } = require('pg');

// Conexión a Supabase
const connectionString = 'postgresql://postgres.bfzwvshxtfryawcvqwyu:MCPCursor123@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

// Configuración optimizada del pool
const pool = new Pool({
  connectionString,
  max: 10, // Máximo número de conexiones
  idleTimeoutMillis: 30000, // Tiempo máximo de inactividad
  connectionTimeoutMillis: 10000, // Tiempo máximo para conectar
  ssl: { rejectUnauthorized: false }, // Supabase requiere SSL
});

// Evento de error del pool
pool.on('error', (err, client) => {
  console.error('Error inesperado en el cliente del pool:', err);
});

// Función para ejecutar una consulta de prueba
async function testQuery() {
  const client = await pool.connect();
  
  try {
    console.log('Conexión establecida correctamente');
    
    // Consulta de prueba
    const res = await client.query('SELECT current_database() as db_name, current_timestamp as server_time');
    console.log('Resultado:', res.rows[0]);
    
    // Probar otra consulta para obtener las tablas
    const tables = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 5
    `);
    
    console.log('\nTablas en la base de datos (primeras 5):');
    tables.rows.forEach(row => {
      console.log(`- ${row.table_schema}.${row.table_name}`);
    });
    
    // Verificar el número de conexiones
    const poolStatus = await client.query(`
      SELECT count(*) as active_connections
      FROM pg_stat_activity
      WHERE application_name = 'psql'
    `);
    
    console.log('\nConexiones activas:', poolStatus.rows[0].active_connections);
    
  } catch (err) {
    console.error('Error ejecutando consulta:', err);
  } finally {
    client.release();
    console.log('Conexión liberada');
  }
}

// Ejecutar la prueba
console.log('Iniciando prueba de conexión pool a Supabase...');

testQuery()
  .then(() => {
    console.log('Prueba completada exitosamente');
    pool.end().then(() => {
      console.log('Pool cerrado correctamente');
      process.exit(0);
    });
  })
  .catch(err => {
    console.error('Error en la prueba:', err);
    pool.end().then(() => {
      console.error('Pool cerrado debido a error');
      process.exit(1);
    });
  }); 