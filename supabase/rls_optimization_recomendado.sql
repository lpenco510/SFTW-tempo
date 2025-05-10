-- Script optimizado para políticas RLS en sistema de comercio exterior desde Argentina
-- Diseñado para trabajar con las políticas existentes y mejorar rendimiento sin afectar seguridad

-- 1. Crear función optimizada para obtener el auth.uid() con cache
CREATE OR REPLACE FUNCTION get_auth_uid() 
RETURNS UUID AS $$
    SELECT auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 2. Función para verificar pertenencia a una empresa (mejora rendimiento en consultas repetitivas)
CREATE OR REPLACE FUNCTION user_belongs_to_company(company_id UUID) 
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_companies
        WHERE user_companies.company_id = company_id
        AND user_companies.user_id = get_auth_uid()
    );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 3. Función para verificar si usuario es administrador
CREATE OR REPLACE FUNCTION is_admin_user() 
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = get_auth_uid()
        AND profiles.role = 'admin'::user_role
    );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 4. Índices para mejorar rendimiento de consultas frecuentes (solo agregar si no existen)
DO $$ 
BEGIN
    -- Verificar y crear índices para user_companies
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_companies_user_id') THEN
        CREATE INDEX idx_user_companies_user_id ON public.user_companies(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_companies_company_id') THEN
        CREATE INDEX idx_user_companies_company_id ON public.user_companies(company_id);
    END IF;
    
    -- Verificar y crear índices para shipments
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_shipments_company_id') THEN
        CREATE INDEX idx_shipments_company_id ON public.shipments(company_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_shipments_created_by') THEN
        CREATE INDEX idx_shipments_created_by ON public.shipments(created_by);
    END IF;
    
    -- Verificar y crear índices para otros elementos clave de comercio exterior
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documents_company_id') THEN
        CREATE INDEX idx_documents_company_id ON public.documents(company_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documents_created_by') THEN
        CREATE INDEX idx_documents_created_by ON public.documents(created_by);
    END IF;
END $$;

-- 5. Campos para búsqueda optimizada en documentos de comercio exterior
DO $$ 
BEGIN
    -- Agregar vector de búsqueda a shipments si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'shipments' 
        AND column_name = 'search_vector'
    ) THEN
        ALTER TABLE public.shipments ADD COLUMN search_vector tsvector;
        
        -- Trigger para actualizar automáticamente el vector de búsqueda
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
        
        DROP TRIGGER IF EXISTS update_shipment_search_vector_trigger ON public.shipments;
        CREATE TRIGGER update_shipment_search_vector_trigger
        BEFORE INSERT OR UPDATE ON public.shipments
        FOR EACH ROW
        EXECUTE FUNCTION update_shipment_search_vector();
        
        -- Indexar el vector de búsqueda
        CREATE INDEX IF NOT EXISTS idx_shipments_search ON public.shipments USING gin(search_vector);
        
        -- Actualizar vectores para registros existentes
        UPDATE public.shipments SET reference_number = reference_number;
    END IF;
END $$;

-- 6. Trigger para actualizar automáticamente campos updated_at
DO $$ 
BEGIN
    -- Crear función para actualizar timestamps si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
        CREATE OR REPLACE FUNCTION set_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    END IF;
    
    -- Verificar y crear triggers para cada tabla relevante
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_companies_set_updated_at') THEN
        CREATE TRIGGER trigger_companies_set_updated_at
        BEFORE UPDATE ON public.companies
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_shipments_set_updated_at') THEN
        CREATE TRIGGER trigger_shipments_set_updated_at
        BEFORE UPDATE ON public.shipments
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_documents_set_updated_at') THEN
        CREATE TRIGGER trigger_documents_set_updated_at
        BEFORE UPDATE ON public.documents
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- 7. Tabla y función para auditoría de operaciones críticas (para cumplimiento normativo aduanero)
DO $$ 
BEGIN
    -- Crear tabla de auditoría si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        CREATE TABLE public.audit_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            table_name TEXT NOT NULL,
            record_id UUID NOT NULL,
            operation TEXT NOT NULL,
            old_data JSONB,
            new_data JSONB,
            user_id UUID,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- RLS para audit_logs (solo admins pueden ver, todos pueden insertar)
        ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
        FOR SELECT USING (is_admin_user());
        
        CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
        FOR INSERT WITH CHECK (true);
        
        -- Función para registrar auditoría
        CREATE OR REPLACE FUNCTION log_audit() RETURNS TRIGGER AS $$
        DECLARE
            audit_row public.audit_logs;
            excluded_cols TEXT[] = ARRAY[]::TEXT[];
        BEGIN
            audit_row = ROW(
                uuid_generate_v4(),
                TG_TABLE_NAME::TEXT,
                (CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END),
                TG_OP,
                CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' 
                    THEN jsonb_strip_nulls(row_to_json(OLD)::jsonb - excluded_cols) 
                    ELSE NULL 
                END,
                CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' 
                    THEN jsonb_strip_nulls(row_to_json(NEW)::jsonb - excluded_cols) 
                    ELSE NULL 
                END,
                get_auth_uid(),
                now()
            );
            
            INSERT INTO public.audit_logs VALUES (audit_row.*);
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        -- Aplicar triggers de auditoría a tablas críticas para comercio exterior
        CREATE TRIGGER audit_shipments_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.shipments
        FOR EACH ROW EXECUTE FUNCTION log_audit();
        
        CREATE TRIGGER audit_documents_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.documents
        FOR EACH ROW EXECUTE FUNCTION log_audit();
    END IF;
END $$;

-- 8. Tabla para seguimiento de eventos aduaneros si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customs_events') THEN
        CREATE TABLE public.customs_events (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            shipment_id UUID NOT NULL REFERENCES public.shipments(id),
            event_type TEXT NOT NULL,
            event_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
            location TEXT,
            description TEXT,
            attachments JSONB,
            recorded_by UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- RLS para customs_events
        ALTER TABLE public.customs_events ENABLE ROW LEVEL SECURITY;
        
        -- Políticas
        CREATE POLICY "customs_events_select_policy" ON public.customs_events
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.shipments s
                JOIN public.user_companies uc ON s.company_id = uc.company_id
                WHERE s.id = customs_events.shipment_id
                AND uc.user_id = get_auth_uid()
            ) OR is_admin_user()
        );
        
        CREATE POLICY "customs_events_insert_policy" ON public.customs_events
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.shipments s
                JOIN public.user_companies uc ON s.company_id = uc.company_id
                WHERE s.id = customs_events.shipment_id
                AND uc.user_id = get_auth_uid()
            ) OR is_admin_user()
        );
        
        CREATE POLICY "customs_events_update_policy" ON public.customs_events
        FOR UPDATE USING (
            recorded_by = get_auth_uid() OR is_admin_user()
        );
        
        -- Índices
        CREATE INDEX idx_customs_events_shipment_id ON public.customs_events(shipment_id);
        CREATE INDEX idx_customs_events_recorded_by ON public.customs_events(recorded_by);
        
        -- Trigger para updated_at
        CREATE TRIGGER trigger_customs_events_set_updated_at
        BEFORE UPDATE ON public.customs_events
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- 9. COMENTARIO IMPORTANTE:
-- Este script está diseñado para optimizar sin modificar las políticas existentes
-- Para implementar, ejecutar en el entorno de prueba primero y verificar funcionamiento
-- Las políticas RLS actuales permanecen intactas, solo se añaden optimizaciones 