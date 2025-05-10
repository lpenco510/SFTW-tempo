-- Script para corregir las inconsistencias entre name y nombre_empresa en la tabla companies
-- Ejecutar en la consola SQL de Supabase

-- 1. Primero, arreglar empresas donde name está presente pero nombre_empresa es NULL
UPDATE companies 
SET nombre_empresa = name
WHERE nombre_empresa IS NULL AND name IS NOT NULL;

-- 2. Luego, arreglar empresas donde nombre_empresa está presente pero name es NULL
UPDATE companies 
SET name = nombre_empresa
WHERE name IS NULL AND nombre_empresa IS NOT NULL;

-- 3. Finalmente, arreglar empresas donde ambos campos tienen valores diferentes
-- (priorizamos nombre_empresa ya que es el campo más usado en la aplicación)
UPDATE companies 
SET name = nombre_empresa
WHERE name != nombre_empresa;

-- 4. Similar para tax_id y rut
UPDATE companies 
SET tax_id = rut
WHERE tax_id IS NULL AND rut IS NOT NULL;

UPDATE companies 
SET rut = tax_id
WHERE rut IS NULL AND tax_id IS NOT NULL;

UPDATE companies 
SET rut = tax_id
WHERE rut != tax_id AND tax_id IS NOT NULL;

-- 5. Crear trigger para mantener sincronizados estos campos (si no existe)
-- Este trigger actualiza automáticamente el campo duplicado cuando uno cambia
CREATE OR REPLACE FUNCTION sync_company_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se actualiza name, actualizar también nombre_empresa
    IF NEW.name IS DISTINCT FROM OLD.name THEN
        NEW.nombre_empresa = NEW.name;
    END IF;
    
    -- Si se actualiza nombre_empresa, actualizar también name
    IF NEW.nombre_empresa IS DISTINCT FROM OLD.nombre_empresa THEN
        NEW.name = NEW.nombre_empresa;
    END IF;
    
    -- Si se actualiza tax_id, actualizar también rut
    IF NEW.tax_id IS DISTINCT FROM OLD.tax_id THEN
        NEW.rut = NEW.tax_id;
    END IF;
    
    -- Si se actualiza rut, actualizar también tax_id
    IF NEW.rut IS DISTINCT FROM OLD.rut THEN
        NEW.tax_id = NEW.rut;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear o reemplazar el trigger
DROP TRIGGER IF EXISTS sync_company_fields_trigger ON companies;
CREATE TRIGGER sync_company_fields_trigger
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION sync_company_fields();

-- 6. Verificar campos nulos en settings y corregirlos
UPDATE companies
SET settings = '{}'::jsonb
WHERE settings IS NULL;

-- 7. Mejorar las RLS policies para la tabla companies
DROP POLICY IF EXISTS "companies_optimized_policy" ON "companies";

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
    -- O si el usuario es admin/propietario directo
    OR id IN (
        SELECT company_id 
        FROM user_companies
        WHERE user_id = auth.uid() 
        AND role IN ('ADMIN', 'OWNER', 'admin', 'owner')
    )
); 