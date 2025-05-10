/**
 * Script para verificar y solucionar inconsistencias de nombres en la tabla companies
 * Ejecutar con: node scripts/fix_columns.cjs
 */

const { Pool } = require('pg');

// Conexión a Supabase
const connectionString = 'postgresql://postgres.bfzwvshxtfryawcvqwyu:MCPCursor123@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString,
  max: 5,
  ssl: { rejectUnauthorized: false },
});

async function checkAndFixColumns() {
  const client = await pool.connect();
  
  try {
    console.log('Verificando columnas de la tabla companies...');
    
    // 1. Verificar si existen las columnas name y nombre_empresa
    const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'companies' 
      AND column_name IN ('name', 'nombre', 'nombre_empresa', 'tax_id', 'identificador_fiscal', 'rut')
    `);
    
    console.log('Columnas encontradas:');
    const columnsFound = checkColumns.rows.map(row => row.column_name);
    console.log(columnsFound);
    
    // Verificar inconsistencias y proponer soluciones
    const hasBothNameColumns = columnsFound.includes('name') && columnsFound.includes('nombre_empresa');
    const hasBothTaxColumns = columnsFound.includes('tax_id') && columnsFound.includes('rut');
    
    if (hasBothNameColumns) {
      console.log('\nDetectada duplicidad: columnas "name" y "nombre_empresa"');
      console.log('Verificando datos para sincronización...');
      
      // Verificar si hay datos diferentes en ambas columnas
      const compareNames = await client.query(`
        SELECT id, name, nombre_empresa 
        FROM companies 
        WHERE name IS DISTINCT FROM nombre_empresa
        AND (name IS NOT NULL OR nombre_empresa IS NOT NULL)
      `);
      
      if (compareNames.rows.length > 0) {
        console.log(`Hay ${compareNames.rows.length} registros con valores diferentes:`);
        compareNames.rows.forEach(row => {
          console.log(`- ID: ${row.id}, name: "${row.name}", nombre_empresa: "${row.nombre_empresa}"`);
        });
        
        console.log('\nRecomendación: sincronizar los valores de ambas columnas');
        console.log('SQL para sincronizar (name -> nombre_empresa):');
        console.log(`
          UPDATE companies 
          SET nombre_empresa = name 
          WHERE name IS NOT NULL AND (nombre_empresa IS NULL OR nombre_empresa = '');
        `);
        
        console.log('\nSQL para sincronizar (nombre_empresa -> name):');
        console.log(`
          UPDATE companies 
          SET name = nombre_empresa 
          WHERE nombre_empresa IS NOT NULL AND (name IS NULL OR name = '');
        `);
      } else {
        console.log('No se encontraron discrepancias entre las columnas name y nombre_empresa.');
      }
    }
    
    if (hasBothTaxColumns) {
      console.log('\nDetectada duplicidad: columnas "tax_id" y "rut"');
      console.log('Verificando datos para sincronización...');
      
      // Verificar si hay datos diferentes en ambas columnas
      const compareTaxIds = await client.query(`
        SELECT id, tax_id, rut 
        FROM companies 
        WHERE tax_id IS DISTINCT FROM rut
        AND (tax_id IS NOT NULL OR rut IS NOT NULL)
      `);
      
      if (compareTaxIds.rows.length > 0) {
        console.log(`Hay ${compareTaxIds.rows.length} registros con valores diferentes:`);
        compareTaxIds.rows.forEach(row => {
          console.log(`- ID: ${row.id}, tax_id: "${row.tax_id}", rut: "${row.rut}"`);
        });
        
        console.log('\nRecomendación: sincronizar los valores de ambas columnas');
        console.log('SQL para sincronizar (tax_id -> rut):');
        console.log(`
          UPDATE companies 
          SET rut = tax_id 
          WHERE tax_id IS NOT NULL AND (rut IS NULL OR rut = '');
        `);
        
        console.log('\nSQL para sincronizar (rut -> tax_id):');
        console.log(`
          UPDATE companies 
          SET tax_id = rut 
          WHERE rut IS NOT NULL AND (tax_id IS NULL OR tax_id = '');
        `);
      } else {
        console.log('No se encontraron discrepancias entre las columnas tax_id y rut.');
      }
    }
    
    // Verificar si falta nombre y existe name
    if (!columnsFound.includes('nombre') && columnsFound.includes('name')) {
      console.log('\nLa columna "nombre" no existe pero "name" sí está presente.');
      console.log('El código de la aplicación busca "nombre" pero debe usar "name" o "nombre_empresa".');
      console.log('Recomendación: Modifica el hook useCompanySettings para utilizar la columna correcta.');
    }
    
    // Verificar si falta identificador_fiscal y existe tax_id o rut
    if (!columnsFound.includes('identificador_fiscal') && 
        (columnsFound.includes('tax_id') || columnsFound.includes('rut'))) {
      console.log('\nLa columna "identificador_fiscal" no existe pero "tax_id" o "rut" sí está presente.');
      console.log('El código de la aplicación busca "identificador_fiscal" pero debe usar "tax_id" o "rut".');
      console.log('Recomendación: Modifica el hook useCompanySettings para utilizar la columna correcta.');
    }
    
    console.log('\nResumen y recomendación:');
    console.log('1. Mantener compatibilidad con ambos nombres de columnas en consultas');
    console.log('2. Realizar selects con alias para adaptar los nombres (ej: "name as nombre")');
    console.log('3. Al actualizar, modificar ambas columnas para mantener sincronizados los datos');
    
  } catch (err) {
    console.error('Error verificando columnas:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndFixColumns().catch(err => {
  console.error('Error en el script:', err);
  process.exit(1);
}); 