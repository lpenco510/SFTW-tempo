-- Script para optimizar políticas RLS en Supabase (VERSIÓN CORREGIDA)
-- Este script mejora el rendimiento optimizando las políticas RLS para evitar reevaluaciones
-- innecesarias de funciones como auth.uid() para cada fila.

-- 1. Crear función optimizada para obtener el auth.uid()
CREATE OR REPLACE FUNCTION public.get_auth_uid() 
RETURNS uuid 
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Obtiene el auth.uid() una vez por transacción
  SELECT auth.uid();
$$;

-- 2. Verificar y limpiar políticas redundantes en 'companies'
DO $$
BEGIN
  -- Eliminar políticas redundantes si existen
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'companies' AND policyname = 'Allow all operations for authenticated users on companies') THEN
    DROP POLICY "Allow all operations for authenticated users on companies" ON "public"."companies";
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'companies' AND policyname = 'Permitir todas las operaciones para usuarios autenticados') THEN
    DROP POLICY "Permitir todas las operaciones para usuarios autenticados" ON "public"."companies";
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'companies' AND policyname = 'Permitir todas las operaciones para usuarios autenticados en co') THEN
    DROP POLICY "Permitir todas las operaciones para usuarios autenticados en co" ON "public"."companies";
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'companies' AND policyname = 'companies_public_policy') THEN
    DROP POLICY "companies_public_policy" ON "public"."companies";
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'companies' AND policyname = 'Enable update for company members') THEN
    DROP POLICY "Enable update for company members" ON "public"."companies";
  END IF;
END
$$;

-- 3. Crear una política unificada optimizada para 'companies' si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'companies' AND policyname = 'companies_optimized_policy') THEN
    CREATE POLICY "companies_optimized_policy" ON "public"."companies"
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
  END IF;
END
$$;

-- 4. Verificar y limpiar políticas redundantes en 'user_companies'
DO $$
BEGIN
  -- Eliminar políticas redundantes si existen
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_companies' AND policyname = 'Users can manage own company associations') THEN
    DROP POLICY "Users can manage own company associations" ON "public"."user_companies";
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_companies' AND policyname = 'Users can view own company associations') THEN
    DROP POLICY "Users can view own company associations" ON "public"."user_companies";
  END IF;
END
$$;

-- 5. Crear políticas optimizadas para 'user_companies'
DO $$
BEGIN
  -- Política SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_companies' AND policyname = 'user_companies_select_policy') THEN
    CREATE POLICY "user_companies_select_policy" ON "public"."user_companies"
    FOR SELECT
    USING (
        user_id = get_auth_uid() OR
        auth.role() = 'service_role'
    );
  END IF;

  -- Política INSERT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_companies' AND policyname = 'user_companies_insert_policy') THEN
    CREATE POLICY "user_companies_insert_policy" ON "public"."user_companies"
    FOR INSERT
    WITH CHECK (
        user_id = get_auth_uid() OR
        auth.role() = 'service_role'
    );
  END IF;

  -- Política UPDATE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_companies' AND policyname = 'user_companies_update_policy') THEN
    CREATE POLICY "user_companies_update_policy" ON "public"."user_companies"
    FOR UPDATE
    USING (
        user_id = get_auth_uid() OR
        auth.role() = 'service_role'
    )
    WITH CHECK (
        user_id = get_auth_uid() OR
        auth.role() = 'service_role'
    );
  END IF;

  -- Política DELETE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_companies' AND policyname = 'user_companies_delete_policy') THEN
    CREATE POLICY "user_companies_delete_policy" ON "public"."user_companies"
    FOR DELETE
    USING (
        user_id = get_auth_uid() OR
        auth.role() = 'service_role'
    );
  END IF;
END
$$;

-- 6. Verificar políticas para 'shipments' y crearlas si no existen
DO $$
BEGIN
  -- Habilitar RLS en shipments si no está habilitado
  ALTER TABLE IF EXISTS "public"."shipments" ENABLE ROW LEVEL SECURITY;
  
  -- Política SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shipments' AND policyname = 'Enable read access for authenticated users') THEN
    CREATE POLICY "Enable read access for authenticated users" ON "public"."shipments"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_companies
            WHERE user_companies.company_id = shipments.company_id
            AND user_companies.user_id = get_auth_uid()
        ) OR
        auth.role() = 'service_role'
    );
  END IF;

  -- Política INSERT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shipments' AND policyname = 'Enable insert for authenticated users') THEN
    CREATE POLICY "Enable insert for authenticated users" ON "public"."shipments"
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_companies
            WHERE user_companies.company_id = shipments.company_id
            AND user_companies.user_id = get_auth_uid()
        ) OR
        auth.role() = 'service_role'
    );
  END IF;

  -- Política UPDATE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shipments' AND policyname = 'Enable update for creators and admins') THEN
    CREATE POLICY "Enable update for creators and admins" ON "public"."shipments"
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_companies
            WHERE user_companies.company_id = shipments.company_id
            AND user_companies.user_id = get_auth_uid()
        ) OR
        auth.role() = 'service_role'
    );
  END IF;
END
$$;

-- 7. Crear índices para mejorar el rendimiento si no existen
DO $$
BEGIN
  -- Índices para shipments
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'shipments' AND indexname = 'idx_shipments_company_id') THEN
    CREATE INDEX idx_shipments_company_id ON public.shipments (company_id);
  END IF;
  
  -- Índices para user_companies
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'user_companies' AND indexname = 'idx_user_companies_user_id') THEN
    CREATE INDEX idx_user_companies_user_id ON public.user_companies (user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'user_companies' AND indexname = 'idx_user_companies_company_id') THEN
    CREATE INDEX idx_user_companies_company_id ON public.user_companies (company_id);
  END IF;
END
$$; 