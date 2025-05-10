-- Script para asegurar coherencia entre base de datos y código
-- Este script ajusta las tablas para que sean compatibles con el código actual

-- 1. Arreglar la tabla companies para tener campos consistentes
-- Nota: No eliminamos nombre_empresa y rut para evitar pérdida de datos
-- En su lugar, creamos una función de migración para mantener los datos sincronizados

-- Crear función para sincronizar campos old/new
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

-- Crear trigger para sincronizar campos
DROP TRIGGER IF EXISTS sync_company_fields_trigger ON companies;
CREATE TRIGGER sync_company_fields_trigger
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION sync_company_fields();

-- Ejecutar actualización inicial para sincronizar datos existentes
UPDATE companies SET 
    nombre_empresa = name,
    rut = tax_id
WHERE nombre_empresa IS NULL OR rut IS NULL;

UPDATE companies SET 
    name = nombre_empresa,
    tax_id = rut
WHERE name IS NULL OR tax_id IS NULL;

-- 2. Crear función para obtener el ID del usuario actual
CREATE OR REPLACE FUNCTION public.get_auth_uid()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT auth.uid();
$$;

-- 3. Revisar la tabla profiles para asegurar compatibilidad con auth.ts
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 4. Optimizar tipos en la tabla user_companies
ALTER TABLE user_companies
ALTER COLUMN role TYPE text;

-- Actualizar cualquier rol existente para asegurar formato estándar
UPDATE user_companies
SET role = UPPER(role)
WHERE role IS NOT NULL AND role NOT IN ('ADMIN', 'OWNER', 'MEMBER', 'GUEST');

-- 5. Ajustar política RLS para la tabla companies
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
        AND user_companies.user_id = get_auth_uid()
    )
    -- O si el usuario es admin/propietario directo
    OR id IN (
        SELECT company_id 
        FROM user_companies
        WHERE user_id = get_auth_uid() 
        AND role IN ('ADMIN', 'OWNER')
    )
); 