  -- Script para optimizar políticas RLS en Supabase
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
    SELECT auth.uid()
  $$;

  -- Función auxiliar optimizada para verificar pertenencia a empresa
  CREATE OR REPLACE FUNCTION public.user_belongs_to_company(company_id UUID)
  RETURNS BOOLEAN AS $$
  DECLARE
    belongs BOOLEAN;
    user_id UUID;
  BEGIN
    -- Optimización: usar la función get_auth_uid() en lugar de auth.uid() directamente
    user_id := get_auth_uid();
    
    SELECT EXISTS (
      SELECT 1 FROM public.user_companies uc
      WHERE uc.user_id = user_id AND uc.company_id = user_belongs_to_company.company_id
    ) INTO belongs;
    
    RETURN belongs;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Función auxiliar optimizada para verificar si es admin
  CREATE OR REPLACE FUNCTION public.is_admin_user()
  RETURNS BOOLEAN AS $$
  DECLARE
    is_admin BOOLEAN;
    user_id UUID;
  BEGIN
    -- Optimización: usar la función get_auth_uid() en lugar de auth.uid() directamente
    user_id := get_auth_uid();
    
    SELECT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = user_id AND (role = 'superadmin' OR role = 'admin')
    ) INTO is_admin;
    
    RETURN is_admin;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- 2. Eliminar políticas redundantes en 'companies'
  DROP POLICY IF EXISTS "Allow all operations for authenticated users on companies" ON "public"."companies";
  DROP POLICY IF EXISTS "Permitir todas las operaciones para usuarios autenticados" ON "public"."companies";
  DROP POLICY IF EXISTS "Permitir todas las operaciones para usuarios autenticados en co" ON "public"."companies";
  DROP POLICY IF EXISTS "companies_public_policy" ON "public"."companies";
  DROP POLICY IF EXISTS "Enable update for company members" ON "public"."companies";
  DROP POLICY IF EXISTS "Admins pueden ver todas las empresas" ON public.companies;
  DROP POLICY IF EXISTS "Usuarios pueden ver sus empresas" ON public.companies;

  -- 3. Crear una única política optimizada para 'companies'
  CREATE POLICY "companies_unified_policy" ON "public"."companies"
  USING (
      auth.role() = 'authenticated' OR
      auth.role() = 'service_role'
  )
  WITH CHECK (
      EXISTS (
          SELECT 1 FROM public.user_companies uc
          WHERE uc.company_id = id
          AND uc.user_id = (SELECT get_auth_uid())
      )
  );

  -- 4. Eliminar políticas redundantes en 'user_companies'
  DROP POLICY IF EXISTS "Users can manage own company associations" ON "public"."user_companies";
  DROP POLICY IF EXISTS "Users can view own company associations" ON "public"."user_companies";
  DROP POLICY IF EXISTS "Admins pueden gestionar todas las relaciones" ON public.user_companies;
  DROP POLICY IF EXISTS "Usuarios pueden ver sus relaciones" ON public.user_companies;

  -- 5. Crear políticas optimizadas para 'user_companies'
  CREATE POLICY "user_companies_select_policy" ON "public"."user_companies"
  FOR SELECT
  USING (
      user_id = (SELECT get_auth_uid()) OR
      auth.role() = 'service_role'
  );

  CREATE POLICY "user_companies_insert_policy" ON "public"."user_companies"
  FOR INSERT
  WITH CHECK (
      user_id = (SELECT get_auth_uid()) OR
      auth.role() = 'service_role'
  );

  CREATE POLICY "user_companies_update_policy" ON "public"."user_companies"
  FOR UPDATE
  USING (
      user_id = (SELECT get_auth_uid()) OR
      auth.role() = 'service_role'
  )
  WITH CHECK (
      user_id = (SELECT get_auth_uid()) OR
      auth.role() = 'service_role'
  );

  CREATE POLICY "user_companies_delete_policy" ON "public"."user_companies"
  FOR DELETE
  USING (
      user_id = (SELECT get_auth_uid()) OR
      auth.role() = 'service_role'
  );

  -- 6. Crear la tabla 'shipments' si no existe
  CREATE TABLE IF NOT EXISTS "public"."shipments" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "type" TEXT NOT NULL CHECK (type IN ('import', 'export')),
    "reference_number" TEXT NOT NULL,
    "origin_country" TEXT NOT NULL,
    "destination_country" TEXT NOT NULL,
    "estimated_value" NUMERIC NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "company_id" UUID NOT NULL REFERENCES public.companies(id),
    "created_by" UUID NOT NULL REFERENCES auth.users(id),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "search_vector" tsvector
  );

  -- 7. Agregar políticas RLS optimizadas para la tabla 'shipments'
  ALTER TABLE "public"."shipments" ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "shipments_select_policy" ON "public"."shipments"
  FOR SELECT
  USING (
      EXISTS (
          SELECT 1 FROM public.user_companies uc
          WHERE uc.company_id = shipments.company_id
          AND uc.user_id = (SELECT get_auth_uid())
      ) OR
      auth.role() = 'service_role'
  );

  CREATE POLICY "shipments_insert_policy" ON "public"."shipments"
  FOR INSERT
  WITH CHECK (
      EXISTS (
          SELECT 1 FROM public.user_companies uc
          WHERE uc.company_id = shipments.company_id
          AND uc.user_id = (SELECT get_auth_uid())
      ) OR
      auth.role() = 'service_role'
  );

  CREATE POLICY "shipments_update_policy" ON "public"."shipments"
  FOR UPDATE
  USING (
      EXISTS (
          SELECT 1 FROM public.user_companies uc
          WHERE uc.company_id = shipments.company_id
          AND uc.user_id = (SELECT get_auth_uid())
      ) OR
      auth.role() = 'service_role'
  )
  WITH CHECK (
      EXISTS (
          SELECT 1 FROM public.user_companies uc
          WHERE uc.company_id = shipments.company_id
          AND uc.user_id = (SELECT get_auth_uid())
      ) OR
      auth.role() = 'service_role'
  );

  CREATE POLICY "shipments_delete_policy" ON "public"."shipments"
  FOR DELETE
  USING (
      EXISTS (
          SELECT 1 FROM public.user_companies uc
          WHERE uc.company_id = shipments.company_id
          AND uc.user_id = (SELECT get_auth_uid())
      ) OR
      auth.role() = 'service_role'
  );

  -- 8. Crear índices para mejorar el rendimiento de consultas comunes
  CREATE INDEX IF NOT EXISTS "shipments_company_id_idx" ON "public"."shipments" ("company_id");
  CREATE INDEX IF NOT EXISTS "shipments_created_by_idx" ON "public"."shipments" ("created_by");
  CREATE INDEX IF NOT EXISTS "shipments_status_idx" ON "public"."shipments" ("status");
  CREATE INDEX IF NOT EXISTS "user_companies_user_id_idx" ON "public"."user_companies" ("user_id");
  CREATE INDEX IF NOT EXISTS "user_companies_company_id_idx" ON "public"."user_companies" ("company_id");

  -- 9. Añadir trigger para actualizar automáticamente updated_at
  CREATE OR REPLACE FUNCTION update_modified_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = now();
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER update_shipments_modtime
  BEFORE UPDATE ON "public"."shipments"
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

  CREATE TRIGGER update_companies_modtime
  BEFORE UPDATE ON "public"."companies"
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

  -- 10. Añadir campo para optimizar la búsqueda de texto completo
  ALTER TABLE "public"."shipments" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;

  CREATE OR REPLACE FUNCTION update_shipment_search_vector()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.search_vector = to_tsvector('spanish', 
          coalesce(NEW.reference_number, '') || ' ' || 
          coalesce(NEW.origin_country, '') || ' ' || 
          coalesce(NEW.destination_country, '') || ' ' ||
          coalesce(NEW.status, '')
      );
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER update_shipment_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "public"."shipments"
  FOR EACH ROW
  EXECUTE FUNCTION update_shipment_search_vector();

  CREATE INDEX IF NOT EXISTS "shipments_search_idx" ON "public"."shipments" USING gin(search_vector);

  -- Actualizar los vectores de búsqueda para los registros existentes
  UPDATE "public"."shipments" SET updated_at = updated_at;

  -- Crear una política unificada y optimizada para la tabla companies
  CREATE POLICY "Política unificada para companies" 
  ON public.companies 
  USING (
    is_admin_user() OR 
    user_belongs_to_company(id)
  );

  -- Crear políticas optimizadas para user_companies
  DROP POLICY IF EXISTS "Admins pueden gestionar todas las relaciones" ON public.user_companies;
  DROP POLICY IF EXISTS "Usuarios pueden ver sus relaciones" ON public.user_companies;

  -- Política para SELECT optimizada
  CREATE POLICY "SELECT optimizado para user_companies" 
  ON public.user_companies
  FOR SELECT
  USING (
    is_admin_user() OR 
    user_id = get_auth_uid()
  );

  -- Política para INSERT optimizada
  CREATE POLICY "INSERT optimizado para user_companies" 
  ON public.user_companies
  FOR INSERT
  WITH CHECK (
    is_admin_user() OR 
    -- Solo permitir insertar relaciones para su propio usuario
    user_id = get_auth_uid()
  );

  -- Política para UPDATE optimizada
  CREATE POLICY "UPDATE optimizado para user_companies" 
  ON public.user_companies
  FOR UPDATE
  USING (
    is_admin_user() OR 
    user_id = get_auth_uid()
  );

  -- Política para DELETE optimizada
  CREATE POLICY "DELETE optimizado para user_companies" 
  ON public.user_companies
  FOR DELETE
  USING (
    is_admin_user() OR 
    user_id = get_auth_uid()
  );

  -- Crear tabla de envíos con índices optimizados
  CREATE TABLE IF NOT EXISTS public.shipments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      reference_number TEXT,
      company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'pending',
      origin TEXT,
      destination TEXT,
      estimated_delivery TIMESTAMPTZ,
      actual_delivery TIMESTAMPTZ,
      carrier TEXT,
      tracking_number TEXT,
      weight DECIMAL(10,2),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by UUID REFERENCES public.profiles(id),
      
      -- Campo de búsqueda optimizado
      search_vector TSVECTOR GENERATED ALWAYS AS (
          setweight(to_tsvector('spanish', coalesce(reference_number, '')), 'A') ||
          setweight(to_tsvector('spanish', coalesce(status, '')), 'B') ||
          setweight(to_tsvector('spanish', coalesce(carrier, '')), 'C') ||
          setweight(to_tsvector('spanish', coalesce(tracking_number, '')), 'A')
      ) STORED
  );

  -- Habilitar RLS en la tabla shipments
  ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

  -- Crear políticas para la tabla shipments
  CREATE POLICY "Admins pueden gestionar todos los envíos" 
  ON public.shipments
  USING (
    is_admin_user()
  );

  CREATE POLICY "Usuarios pueden gestionar envíos de sus empresas" 
  ON public.shipments
  USING (
    user_belongs_to_company(company_id)
  );

  -- Crear índices para mejorar el rendimiento de las consultas
  CREATE INDEX IF NOT EXISTS idx_shipments_search ON public.shipments USING GIN (search_vector);
  CREATE INDEX IF NOT EXISTS idx_shipments_company_id ON public.shipments (company_id);
  CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments (status);
  CREATE INDEX IF NOT EXISTS idx_shipments_dates ON public.shipments (estimated_delivery, actual_delivery);
  CREATE INDEX IF NOT EXISTS idx_user_companies_composite ON public.user_companies (user_id, company_id);

  -- Trigger para actualizar automáticamente el timestamp de updated_at
  CREATE OR REPLACE FUNCTION trigger_set_timestamp()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Aplicar trigger a la tabla shipments
  CREATE TRIGGER set_timestamp_shipments
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

  -- Aplicar trigger a la tabla user_companies si no existe
  DROP TRIGGER IF EXISTS set_timestamp_user_companies ON public.user_companies;
  CREATE TRIGGER set_timestamp_user_companies
  BEFORE UPDATE ON public.user_companies
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

  -- Optimización de Políticas RLS para Supabase
  -- Este archivo contiene recomendaciones para mejorar el rendimiento de RLS

  -- 1. Crear una función optimizada para obtener auth.uid()
  CREATE OR REPLACE FUNCTION public.get_auth_uid()
  RETURNS uuid
  LANGUAGE sql STABLE
  AS $$
    SELECT auth.uid();
  $$;

  -- 2. Optimizar políticas de la tabla 'companies'
  -- Primero eliminar políticas existentes
  DROP POLICY IF EXISTS "Companies are viewable by company members" ON public.companies;
  DROP POLICY IF EXISTS "Companies are updatable by company admins" ON public.companies;

  -- Crear una nueva política optimizada que utilice get_auth_uid()
  CREATE POLICY "Companies policy" ON public.companies
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies uc
      WHERE uc.company_id = id
        AND uc.user_id = get_auth_uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_companies uc
      WHERE uc.company_id = id
        AND uc.user_id = get_auth_uid()
        AND uc.role IN ('admin', 'owner')
    )
  );

  -- 3. Optimizar políticas de la tabla 'user_companies'
  -- Primero eliminar políticas existentes
  DROP POLICY IF EXISTS "User companies are viewable by members" ON public.user_companies;
  DROP POLICY IF EXISTS "User companies are insertable by members" ON public.user_companies;
  DROP POLICY IF EXISTS "User companies are updatable by admins" ON public.user_companies;

  -- Crear políticas optimizadas
  -- Para SELECT
  CREATE POLICY "User companies viewable" ON public.user_companies
  FOR SELECT USING (
    user_id = get_auth_uid() OR
    company_id IN (
      SELECT company_id FROM public.user_companies
      WHERE user_id = get_auth_uid() AND role IN ('admin', 'owner')
    )
  );

  -- Para INSERT
  CREATE POLICY "User companies insertable" ON public.user_companies
  FOR INSERT WITH CHECK (
    get_auth_uid() IN (
      SELECT uc.user_id FROM public.user_companies uc
      WHERE uc.company_id = company_id AND uc.role IN ('admin', 'owner')
    )
  );

  -- Para UPDATE
  CREATE POLICY "User companies updatable" ON public.user_companies
  FOR UPDATE USING (
    get_auth_uid() IN (
      SELECT uc.user_id FROM public.user_companies uc
      WHERE uc.company_id = company_id AND uc.role IN ('admin', 'owner')
    )
  ) WITH CHECK (
    get_auth_uid() IN (
      SELECT uc.user_id FROM public.user_companies uc
      WHERE uc.company_id = company_id AND uc.role IN ('admin', 'owner')
    )
  );

  -- 4. Verificar que RLS está habilitado en las tablas
  ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;

  -- 5. Crear índices para mejorar el rendimiento de consultas RLS
  CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON public.user_companies(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON public.user_companies(company_id);
  CREATE INDEX IF NOT EXISTS idx_user_companies_role ON public.user_companies(role);

  -- 6. Revisar los permisos de las tablas
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_companies TO authenticated;

  -- 7. Actualizar el trigger para mantener campos updated_at
  CREATE OR REPLACE FUNCTION public.update_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- 8. Asegurarse de que los triggers estén aplicados
  DROP TRIGGER IF EXISTS companies_updated_at ON public.companies;
  CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

  DROP TRIGGER IF EXISTS user_companies_updated_at ON public.user_companies;
  CREATE TRIGGER user_companies_updated_at
  BEFORE UPDATE ON public.user_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

  -- Optimización de políticas RLS para IT CARGO
  -- Este script implementa políticas RLS optimizadas que evitan calcular auth.uid() múltiples veces

  -- 1. Verificar si ya existe la función optimizada get_auth_uid
  DO $$
  BEGIN
      IF NOT EXISTS (
          SELECT 1 FROM pg_proc 
          WHERE proname = 'get_auth_uid' 
          AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ) THEN
          -- Crear función optimizada para obtener auth.uid si no existe
          CREATE OR REPLACE FUNCTION public.get_auth_uid()
          RETURNS uuid
          LANGUAGE sql
          SECURITY DEFINER
          SET search_path = public
          AS $$
              SELECT auth.uid();
          $$;
      END IF;
  END
  $$;

  -- 2. Primero eliminar políticas redundantes en la tabla companies
  DROP POLICY IF EXISTS "Allow all operations for authenticated users on companies" ON "public"."companies";
  DROP POLICY IF EXISTS "Permitir todas las operaciones para usuarios autenticados en co" ON "public"."companies";
  DROP POLICY IF EXISTS "companies_public_policy" ON "public"."companies";
  DROP POLICY IF EXISTS "Permitir todas las operaciones para usuarios autenticados" ON "public"."companies";
  DROP POLICY IF EXISTS "Enable update for company members" ON "public"."companies";

  -- 3. Crear una política optimizada para companies
  CREATE POLICY "companies_optimized_policy" ON "public"."companies"
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (
      -- Verificar si el usuario está en user_companies para esta compañía
      EXISTS (
          SELECT 1 
          FROM user_companies 
          WHERE user_companies.company_id = companies.id 
          AND user_companies.user_id = get_auth_uid()
      )
      -- O si el usuario tiene rol de administrador (puede ver todas las compañías)
      OR EXISTS (
          SELECT 1 
          FROM profiles 
          WHERE profiles.user_id = get_auth_uid() 
          AND (profiles.is_admin = true OR profiles.role = 'admin')
      )
  );

  -- 4. Eliminar políticas existentes para user_companies
  DROP POLICY IF EXISTS "Enable select for users based on user_id" ON "public"."user_companies";
  DROP POLICY IF EXISTS "Allow all operations for users through company association" ON "public"."user_companies";
  DROP POLICY IF EXISTS "user_companies_select_policy" ON "public"."user_companies";
  DROP POLICY IF EXISTS "user_companies_insert_policy" ON "public"."user_companies";
  DROP POLICY IF EXISTS "user_companies_delete_policy" ON "public"."user_companies";
  DROP POLICY IF EXISTS "user_companies_update_policy" ON "public"."user_companies";

  -- 5. Crear políticas optimizadas para user_companies
  -- SELECT: Usuario puede ver sus propias asociaciones empresa-usuario
  CREATE POLICY "user_companies_select_optimized" ON "public"."user_companies"
  AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (user_id = get_auth_uid() OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = get_auth_uid() 
      AND profiles.is_admin = true
  ));

  -- INSERT: Usuario solo puede insertarse a sí mismo en una empresa
  CREATE POLICY "user_companies_insert_optimized" ON "public"."user_companies"
  AS PERMISSIVE FOR INSERT
  TO authenticated
  WITH CHECK (user_id = get_auth_uid() OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = get_auth_uid() 
      AND profiles.is_admin = true
  ));

  -- DELETE: Solo puede eliminar su propia asociación
  CREATE POLICY "user_companies_delete_optimized" ON "public"."user_companies"
  AS PERMISSIVE FOR DELETE
  TO authenticated
  USING (user_id = get_auth_uid() OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = get_auth_uid() 
      AND profiles.is_admin = true
  ));

  -- UPDATE: Solo puede actualizar su propia asociación
  CREATE POLICY "user_companies_update_optimized" ON "public"."user_companies"
  AS PERMISSIVE FOR UPDATE
  TO authenticated
  USING (user_id = get_auth_uid() OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = get_auth_uid() 
      AND profiles.is_admin = true
  ));

  -- 6. Asegurar que RLS esté habilitado en ambas tablas
  ALTER TABLE IF EXISTS "public"."companies" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "public"."user_companies" ENABLE ROW LEVEL SECURITY;

  -- 7. Crear índices para mejorar el rendimiento de las búsquedas
  DO $$
  BEGIN
      -- Verificar si los índices ya existen antes de crearlos
      IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE tablename = 'user_companies' AND indexname = 'idx_user_companies_user_id'
      ) THEN
          CREATE INDEX idx_user_companies_user_id ON public.user_companies (user_id);
      END IF;
      
      IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE tablename = 'user_companies' AND indexname = 'idx_user_companies_company_id'
      ) THEN
          CREATE INDEX idx_user_companies_company_id ON public.user_companies (company_id);
      END IF;
      
      IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE tablename = 'profiles' AND indexname = 'idx_profiles_user_id'
      ) THEN
          CREATE INDEX idx_profiles_user_id ON public.profiles (user_id);
      END IF;
      
      IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE tablename = 'profiles' AND indexname = 'idx_profiles_is_admin'
      ) THEN
          CREATE INDEX idx_profiles_is_admin ON public.profiles (is_admin) WHERE is_admin = true;
      END IF;
  END
  $$;

  -- =========================================
  -- PARTE 1: FUNCIÓN OPTIMIZADA PARA AUTH.UID()
  -- =========================================

  -- Creamos una función que cachea la llamada a auth.uid()
  -- para evitar múltiples llamadas innecesarias en políticas

  CREATE OR REPLACE FUNCTION get_auth_uid()
  RETURNS uuid
  LANGUAGE sql STABLE
  AS $$
    SELECT auth.uid();
  $$;

  COMMENT ON FUNCTION get_auth_uid() IS 'Función optimizada para obtener el ID del usuario autenticado actual, reduciendo llamadas a auth.uid()';

  -- =========================================
  -- PARTE 2: POLÍTICAS PARA TABLA COMPANIES
  -- =========================================

  -- Habilitar RLS en la tabla companies
  ALTER TABLE IF EXISTS "companies" ENABLE ROW LEVEL SECURITY;

  -- Eliminar políticas existentes para evitar conflictos
  DROP POLICY IF EXISTS "Usuarios pueden ver sus propias compañías" ON "companies";
  DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias compañías" ON "companies";
  DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propias compañías" ON "companies";
  DROP POLICY IF EXISTS "Usuarios pueden insertar sus propias compañías" ON "companies";
  DROP POLICY IF EXISTS "Usuarios pueden gestionar sus propias compañías" ON "companies";

  -- Crear una política unificada y optimizada para companies
  CREATE POLICY "Usuarios pueden gestionar sus propias compañías" ON "companies"
  USING (
    owner_id = get_auth_uid() OR
    EXISTS (
      SELECT 1 FROM user_companies 
      WHERE user_id = get_auth_uid() 
      AND company_id = id
    )
  );

  -- =========================================
  -- PARTE 3: POLÍTICAS PARA TABLA USER_COMPANIES
  -- =========================================

  -- Habilitar RLS en la tabla user_companies
  ALTER TABLE IF EXISTS "user_companies" ENABLE ROW LEVEL SECURITY;

  -- Eliminar políticas existentes para evitar conflictos
  DROP POLICY IF EXISTS "Usuarios pueden ver sus relaciones" ON "user_companies";
  DROP POLICY IF EXISTS "Usuarios pueden crear sus relaciones" ON "user_companies";
  DROP POLICY IF EXISTS "Usuarios pueden actualizar sus relaciones" ON "user_companies";
  DROP POLICY IF EXISTS "Usuarios pueden eliminar sus relaciones" ON "user_companies";

  -- Crear políticas optimizadas para user_companies
  CREATE POLICY "Usuarios pueden ver sus relaciones" 
  ON "user_companies" FOR SELECT
  USING (user_id = get_auth_uid() OR 
        EXISTS (
          SELECT 1 FROM user_companies uc
          JOIN companies c ON uc.company_id = c.id
          WHERE uc.user_id = get_auth_uid()
          AND uc.role IN ('ADMIN', 'MANAGER')
          AND uc.company_id = company_id
        ));

  CREATE POLICY "Usuarios admin pueden crear relaciones para su compañía" 
  ON "user_companies" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_companies
      WHERE user_id = get_auth_uid()
      AND company_id = NEW.company_id
      AND role = 'ADMIN'
    )
  );

  CREATE POLICY "Usuarios admin pueden actualizar relaciones de su compañía" 
  ON "user_companies" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_companies
      WHERE user_id = get_auth_uid()
      AND company_id = company_id
      AND role = 'ADMIN'
    )
  );

  CREATE POLICY "Usuarios admin pueden eliminar relaciones de su compañía" 
  ON "user_companies" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_companies
      WHERE user_id = get_auth_uid()
      AND company_id = company_id
      AND role = 'ADMIN'
    )
  );

  -- =========================================
  -- PARTE 4: CREAR TABLA SHIPMENTS Y POLÍTICAS
  -- =========================================

  -- Crear tabla shipments si no existe
  CREATE TABLE IF NOT EXISTS "shipments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "company_id" uuid NOT NULL REFERENCES companies(id),
    "tipo" text NOT NULL CHECK (tipo IN ('IMPORTACION', 'EXPORTACION', 'COURIER')),
    "estado" text NOT NULL DEFAULT 'PENDIENTE',
    "referencia_externa" text,
    "fecha_creacion" timestamptz NOT NULL DEFAULT now(),
    "fecha_actualizacion" timestamptz NOT NULL DEFAULT now(),
    "datos_envio" jsonb NOT NULL DEFAULT '{}'::jsonb,
    "documentos" jsonb,
    "notas" text,
    "created_by" uuid REFERENCES auth.users(id),
    "updated_by" uuid REFERENCES auth.users(id),
    "search" tsvector GENERATED ALWAYS AS (
      to_tsvector('spanish', 
        coalesce(referencia_externa, '') || ' ' || 
        coalesce(estado, '') || ' ' || 
        coalesce(tipo, '') || ' ' || 
        coalesce(notas, '')
      )
    ) STORED
  );

  -- Habilitar RLS para la tabla shipments
  ALTER TABLE IF EXISTS "shipments" ENABLE ROW LEVEL SECURITY;

  -- Crear políticas RLS para shipments
  CREATE POLICY "Usuarios pueden ver envíos de sus compañías" 
  ON "shipments" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_companies
      WHERE user_id = get_auth_uid()
      AND company_id = shipments.company_id
    )
  );

  CREATE POLICY "Usuarios pueden crear envíos para sus compañías" 
  ON "shipments" FOR INSERT
  WITH CHECK (
    NEW.created_by = get_auth_uid() AND
    EXISTS (
      SELECT 1 FROM user_companies
      WHERE user_id = get_auth_uid()
      AND company_id = NEW.company_id
    )
  );

  CREATE POLICY "Usuarios pueden actualizar envíos de sus compañías" 
  ON "shipments" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_companies
      WHERE user_id = get_auth_uid()
      AND company_id = shipments.company_id
    )
  );

  CREATE POLICY "Usuarios pueden eliminar envíos de sus compañías" 
  ON "shipments" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_companies uc
      WHERE uc.user_id = get_auth_uid()
      AND uc.company_id = shipments.company_id
      AND uc.role IN ('ADMIN', 'MANAGER')
    )
  );

  -- =========================================
  -- PARTE 5: ÍNDICES PARA OPTIMIZACIÓN
  -- =========================================

  -- Índices para mejorar rendimiento en búsquedas frecuentes
  CREATE INDEX IF NOT EXISTS "idx_shipments_company_id" ON "shipments" ("company_id");
  CREATE INDEX IF NOT EXISTS "idx_shipments_tipo" ON "shipments" ("tipo");
  CREATE INDEX IF NOT EXISTS "idx_shipments_estado" ON "shipments" ("estado");
  CREATE INDEX IF NOT EXISTS "idx_shipments_search" ON "shipments" USING gin("search");

  CREATE INDEX IF NOT EXISTS "idx_user_companies_user_id" ON "user_companies" ("user_id");
  CREATE INDEX IF NOT EXISTS "idx_user_companies_company_id" ON "user_companies" ("company_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_companies_user_company" ON "user_companies" ("user_id", "company_id");

  -- =========================================
  -- PARTE 6: TRIGGERS PARA ACTUALIZACIONES
  -- =========================================

  -- Trigger para actualizar fecha_actualizacion automáticamente
  CREATE OR REPLACE FUNCTION update_modified_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.fecha_actualizacion = now();
      NEW.updated_by = get_auth_uid();
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Crear trigger para tabla shipments
  DROP TRIGGER IF EXISTS set_shipment_updated ON "shipments";
  CREATE TRIGGER set_shipment_updated
  BEFORE UPDATE ON "shipments"
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

  -- =========================================
  -- PARTE 7: FUNCIÓN DE BÚSQUEDA MEJORADA
  -- =========================================

  -- Función para búsqueda de texto completo en envíos
  CREATE OR REPLACE FUNCTION search_shipments(
    search_query text,
    company_id_param uuid DEFAULT NULL,
    tipo_param text DEFAULT NULL
  ) 
  RETURNS SETOF shipments
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
  AS $$
    SELECT *
    FROM shipments
    WHERE 
      (search_query IS NULL OR search @@ to_tsquery('spanish', search_query)) AND
      (company_id_param IS NULL OR company_id = company_id_param) AND
      (tipo_param IS NULL OR tipo = tipo_param) AND
      EXISTS (
        SELECT 1 FROM user_companies
        WHERE user_id = get_auth_uid()
        AND company_id = shipments.company_id
      )
    ORDER BY 
      CASE WHEN search_query IS NOT NULL 
        THEN ts_rank(search, to_tsquery('spanish', search_query))
        ELSE 0
      END DESC,
      fecha_actualizacion DESC
    LIMIT 100;
  $$; 