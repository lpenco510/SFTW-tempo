-- Schema para sistema de gestión de comercio exterior
-- Autor: IT CARGO Development Team
-- Última actualización: 2023-10-10

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Para búsquedas de texto eficientes
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- Para búsquedas sin acentos

---------------------------------------------
-- ESQUEMA Y CONFIGURACIÓN
---------------------------------------------

-- Configuración de Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-super-secret-jwt-key';
ALTER DATABASE postgres SET "app.jwt_exp" TO '3600';

-- Habilitar búsqueda de texto completo
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text AS $$
  SELECT public.unaccent('public.unaccent', $1)
$$ LANGUAGE sql IMMUTABLE;

---------------------------------------------
-- TABLAS PRINCIPALES
---------------------------------------------

-- Empresas
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    identificador_fiscal TEXT NOT NULL UNIQUE,
    direccion TEXT,
    codigo_postal TEXT,
    ciudad TEXT,
    provincia TEXT,
    pais TEXT DEFAULT 'Argentina',
    telefono TEXT,
    email TEXT,
    sitio_web TEXT,
    logo_url TEXT,
    es_importador BOOLEAN DEFAULT FALSE,
    es_exportador BOOLEAN DEFAULT FALSE,
    es_despachante BOOLEAN DEFAULT FALSE,
    es_transportista BOOLEAN DEFAULT FALSE,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('spanish', coalesce(immutable_unaccent(nombre), '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(immutable_unaccent(identificador_fiscal), '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(immutable_unaccent(ciudad), '')), 'C') ||
        setweight(to_tsvector('spanish', coalesce(immutable_unaccent(provincia), '')), 'C')
    ) STORED
);

-- Perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    company_id UUID REFERENCES public.companies(id),
    role TEXT DEFAULT 'visualizador',
    preferences JSONB DEFAULT '{}'::JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_sign_in_at TIMESTAMPTZ
);

-- Relación Usuario-Empresa 
CREATE TABLE IF NOT EXISTS public.user_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

-- Permisos
CREATE TABLE IF NOT EXISTS public.permissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    module TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permisos de usuario
CREATE TABLE IF NOT EXISTS public.user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    UNIQUE(user_id, permission_id)
);

-- Logs de auditoría
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    table_name TEXT NOT NULL,
    record_id TEXT,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

---------------------------------------------
-- MÓDULO DE DESPACHOS
---------------------------------------------

-- Tipos de operación
CREATE TYPE public.operacion_tipo AS ENUM (
    'IMPORTACION', 
    'EXPORTACION', 
    'TRANSITO', 
    'COURIER',
    'TEMPORAL',
    'MUESTRA'
);

-- Estado de despacho
CREATE TYPE public.despacho_estado AS ENUM (
    'BORRADOR',
    'INICIADO',
    'DOCUMENTACION_INCOMPLETA',
    'DOCUMENTACION_COMPLETA',
    'EN_OFICIALIZACION',
    'OFICIALIZADO',
    'EN_VERIFICACION',
    'CANAL_VERDE',
    'CANAL_NARANJA',
    'CANAL_ROJO',
    'OBSERVADO',
    'LIBERADO',
    'CANCELADO',
    'FINALIZADO'
);

-- Tabla principal de despachos
CREATE TABLE IF NOT EXISTS public.despachos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_despacho TEXT UNIQUE,
    tipo_operacion public.operacion_tipo NOT NULL,
    estado public.despacho_estado NOT NULL DEFAULT 'BORRADOR',
    
    -- Referencias
    company_id UUID NOT NULL REFERENCES public.companies(id),
    cliente_id UUID REFERENCES public.companies(id),
    despachante_id UUID REFERENCES public.companies(id),
    
    -- Información aduanera
    aduana_codigo TEXT,
    aduana_descripcion TEXT,
    destinacion_codigo TEXT,
    destinacion_descripcion TEXT,
    fecha_oficializacion DATE,
    
    -- Datos comerciales
    valor_fob DECIMAL(18,2),
    moneda_fob TEXT DEFAULT 'USD',
    valor_flete DECIMAL(18,2),
    valor_seguro DECIMAL(18,2),
    valor_cif_cip DECIMAL(18,2),
    valor_ajustes DECIMAL(18,2),
    valor_fob_peso DECIMAL(18,2),
    valor_cif_cip_peso DECIMAL(18,2),
    tipo_cambio DECIMAL(10,4),
    
    -- Información logística 
    pais_origen TEXT,
    pais_procedencia TEXT,
    pais_destino TEXT,
    puerto_embarque TEXT,
    puerto_destino TEXT,
    fecha_arribo DATE,
    fecha_retiro DATE,
    fecha_entrega DATE,
    incoterm TEXT,
    modalidad_transporte TEXT,
    
    -- Datos físicos
    peso_bruto DECIMAL(14,2),
    peso_neto DECIMAL(14,2),
    cantidad_bultos INTEGER,
    unidad_bultos TEXT,
    
    -- Contenedor
    tipo_contenedor TEXT,
    numero_contenedor TEXT,
    precinto TEXT,
    
    -- Metadatos
    notas TEXT,
    etiquetas TEXT[],
    documentacion_completa BOOLEAN DEFAULT FALSE,
    prioridad INTEGER DEFAULT 0,
    
    -- Fechas de sistema
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id),
    
    -- Búsqueda
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('spanish', coalesce(numero_despacho, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(estado::TEXT, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(tipo_operacion::TEXT, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(immutable_unaccent(aduana_descripcion), '')), 'C') ||
        setweight(to_tsvector('spanish', coalesce(immutable_unaccent(pais_origen), '')), 'D') ||
        setweight(to_tsvector('spanish', coalesce(immutable_unaccent(pais_destino), '')), 'D') ||
        setweight(to_tsvector('spanish', coalesce(numero_contenedor, '')), 'B')
    ) STORED
);

-- Items de despacho
CREATE TABLE IF NOT EXISTS public.despacho_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    despacho_id UUID NOT NULL REFERENCES public.despachos(id) ON DELETE CASCADE,
    posicion INTEGER NOT NULL,
    
    -- Información comercial
    descripcion TEXT NOT NULL,
    ncm TEXT,
    valor_fob DECIMAL(16,2),
    valor_fob_peso DECIMAL(16,2),
    cantidad DECIMAL(14,2),
    unidad_medida TEXT,
    peso_neto DECIMAL(14,2),
    
    -- Impuestos y aranceles
    arancel_porcentaje DECIMAL(6,2),
    arancel_valor DECIMAL(14,2),
    iva_porcentaje DECIMAL(6,2),
    iva_valor DECIMAL(14,2),
    gcias_porcentaje DECIMAL(6,2),
    gcias_valor DECIMAL(14,2),
    
    -- Metadatos
    pais_origen TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    
    UNIQUE(despacho_id, posicion)
);

-- Eventos de despacho
CREATE TABLE IF NOT EXISTS public.despacho_eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    despacho_id UUID NOT NULL REFERENCES public.despachos(id) ON DELETE CASCADE,
    estado_anterior public.despacho_estado,
    estado_nuevo public.despacho_estado NOT NULL,
    descripcion TEXT,
    notificacion_enviada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

-- Observaciones y comentarios
CREATE TABLE IF NOT EXISTS public.despacho_observaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    despacho_id UUID NOT NULL REFERENCES public.despachos(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    es_interna BOOLEAN DEFAULT FALSE,
    es_prioridad BOOLEAN DEFAULT FALSE,
    resuelta BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id)
);

---------------------------------------------
-- MÓDULO DE DOCUMENTOS
---------------------------------------------

-- Tipos de documento
CREATE TYPE public.documento_tipo AS ENUM (
    'FACTURA_COMERCIAL',
    'PACKING_LIST',
    'BL_AWB',
    'CERTIFICADO_ORIGEN',
    'POLIZA_SEGURO',
    'CERTIFICADO_FITOSANITARIO',
    'PERMISO_EMBARQUE',
    'DECLARACION_VALOR',
    'INTERVENCION',
    'DOCUMENTO_TRANSPORTE',
    'OTRO'
);

-- Tabla de documentos
CREATE TABLE IF NOT EXISTS public.documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    despacho_id UUID REFERENCES public.despachos(id) ON DELETE SET NULL,
    empresa_id UUID NOT NULL REFERENCES public.companies(id),
    tipo public.documento_tipo NOT NULL,
    nombre TEXT NOT NULL,
    referencia TEXT,
    fecha_emision DATE,
    fecha_vencimiento DATE,
    descripcion TEXT,
    ruta_archivo TEXT NOT NULL,
    tamano_bytes BIGINT,
    extension TEXT,
    hash_contenido TEXT,
    es_original BOOLEAN DEFAULT TRUE,
    es_publico BOOLEAN DEFAULT FALSE,
    etiquetas TEXT[],
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id),
    
    -- Búsqueda
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('spanish', coalesce(immutable_unaccent(nombre), '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(immutable_unaccent(referencia), '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(tipo::TEXT, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(immutable_unaccent(descripcion), '')), 'C')
    ) STORED
);

-- Historial de versiones de documentos
CREATE TABLE IF NOT EXISTS public.documento_versiones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    documento_id UUID NOT NULL REFERENCES public.documentos(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    ruta_archivo TEXT NOT NULL,
    tamano_bytes BIGINT,
    comentario TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    
    UNIQUE(documento_id, version)
);

-- Compartir documentos
CREATE TABLE IF NOT EXISTS public.documento_compartidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    documento_id UUID NOT NULL REFERENCES public.documentos(id) ON DELETE CASCADE,
    compartido_con UUID REFERENCES public.profiles(id),
    compartido_con_email TEXT,
    enlace_token TEXT,
    fecha_caducidad TIMESTAMPTZ,
    accesos_permitidos INTEGER,
    accesos_usados INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

---------------------------------------------
-- MÓDULO DE LOGÍSTICA
---------------------------------------------

-- Estados de envío
CREATE TYPE public.envio_estado AS ENUM (
    'PROGRAMADO',
    'EN_ORIGEN',
    'EN_TRANSITO',
    'EN_ADUANA',
    'LIBERADO',
    'EN_DESTINO',
    'ENTREGADO',
    'DEMORADO',
    'CANCELADO'
);

-- Tabla principal de envíos
CREATE TABLE IF NOT EXISTS public.envios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    despacho_id UUID REFERENCES public.despachos(id) ON DELETE SET NULL,
    company_id UUID NOT NULL REFERENCES public.companies(id),
    referencia_cliente TEXT,
    estado public.envio_estado NOT NULL DEFAULT 'PROGRAMADO',
    
    -- Transporte
    transportista_id UUID REFERENCES public.companies(id),
    transportista_nombre TEXT,
    modalidad_transporte TEXT NOT NULL,
    vehiculo_tipo TEXT,
    vehiculo_identificacion TEXT,
    conductor_nombre TEXT,
    conductor_documento TEXT,
    
    -- Datos de carga
    tipo_carga TEXT,
    naturaleza_carga TEXT,
    peso_bruto DECIMAL(14,2),
    volumen DECIMAL(14,2),
    cantidad_bultos INTEGER,
    valor_mercaderia DECIMAL(18,2),
    moneda TEXT DEFAULT 'USD',
    
    -- Contenedor
    es_contenedor BOOLEAN DEFAULT FALSE,
    tipo_contenedor TEXT,
    numero_contenedor TEXT,
    precinto TEXT,
    
    -- Ubicaciones
    origen_direccion TEXT,
    origen_ciudad TEXT,
    origen_pais TEXT,
    destino_direccion TEXT,
    destino_ciudad TEXT,
    destino_pais TEXT,
    
    -- Fechas
    fecha_programada TIMESTAMPTZ,
    fecha_retiro TIMESTAMPTZ,
    fecha_estimada_entrega TIMESTAMPTZ,
    fecha_entrega TIMESTAMPTZ,
    
    -- Seguimiento
    latitud_actual DECIMAL(10,6),
    longitud_actual DECIMAL(10,6),
    ubicacion_actual_descripcion TEXT,
    
    -- Documentos
    carta_porte_id UUID REFERENCES public.documentos(id),
    manifiesto_id UUID REFERENCES public.documentos(id),
    
    -- Metadatos
    instrucciones_especiales TEXT,
    notas_internas TEXT,
    etiquetas TEXT[],
    prioridad INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id),
    
    -- Búsqueda
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('spanish', coalesce(referencia_cliente, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(estado::TEXT, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(immutable_unaccent(transportista_nombre), '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(numero_contenedor, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(immutable_unaccent(origen_ciudad), '')), 'C') ||
        setweight(to_tsvector('spanish', coalesce(immutable_unaccent(destino_ciudad), '')), 'C')
    ) STORED
);

-- Eventos de seguimiento
CREATE TABLE IF NOT EXISTS public.envio_eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    envio_id UUID NOT NULL REFERENCES public.envios(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    latitud DECIMAL(10,6),
    longitud DECIMAL(10,6),
    ubicacion_descripcion TEXT,
    estado_anterior public.envio_estado,
    estado_nuevo public.envio_estado,
    fecha_evento TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notificacion_enviada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

-- Costos logísticos
CREATE TABLE IF NOT EXISTS public.envio_costos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    envio_id UUID NOT NULL REFERENCES public.envios(id) ON DELETE CASCADE,
    concepto TEXT NOT NULL,
    descripcion TEXT,
    valor DECIMAL(16,2) NOT NULL,
    moneda TEXT NOT NULL DEFAULT 'ARS',
    tipo_cambio DECIMAL(10,4),
    fecha DATE NOT NULL,
    factura_referencia TEXT,
    es_estimado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

---------------------------------------------
-- MÓDULO FINANCIERO
---------------------------------------------

-- Tipos de operación financiera
CREATE TYPE public.operacion_financiera_tipo AS ENUM (
    'PAGO_PROVEEDOR',
    'PAGO_IMPUESTOS',
    'PAGO_FLETE',
    'PAGO_SEGURO',
    'PAGO_DESPACHANTE',
    'PAGO_TERMINAL',
    'PAGO_ALMACENAJE',
    'LIQUIDACION_DIVISAS',
    'COBRO_CLIENTE',
    'OTRO'
);

-- Estado de operación financiera
CREATE TYPE public.operacion_financiera_estado AS ENUM (
    'PENDIENTE',
    'APROBADA',
    'RECHAZADA',
    'PROCESADA',
    'CANCELADA'
);

-- Tabla de operaciones financieras
CREATE TABLE IF NOT EXISTS public.operaciones_financieras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    despacho_id UUID REFERENCES public.despachos(id) ON DELETE SET NULL,
    company_id UUID NOT NULL REFERENCES public.companies(id),
    tipo public.operacion_financiera_tipo NOT NULL,
    estado public.operacion_financiera_estado NOT NULL DEFAULT 'PENDIENTE',
    
    -- Detalles financieros
    monto DECIMAL(16,2) NOT NULL,
    moneda TEXT NOT NULL,
    tipo_cambio DECIMAL(10,4),
    monto_equivalente DECIMAL(16,2),
    moneda_equivalente TEXT,
    
    -- Referencias
    beneficiario TEXT,
    concepto TEXT NOT NULL,
    referencia_externa TEXT,
    comprobante_id UUID REFERENCES public.documentos(id),
    
    -- Fechas
    fecha_operacion DATE NOT NULL,
    fecha_vencimiento DATE,
    fecha_procesamiento DATE,
    
    -- Aprobación
    requiere_aprobacion BOOLEAN DEFAULT FALSE,
    aprobado_por UUID REFERENCES public.profiles(id),
    fecha_aprobacion TIMESTAMPTZ,
    motivo_rechazo TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id)
);

-- Liquidaciones de divisas
CREATE TABLE IF NOT EXISTS public.liquidaciones_divisas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operacion_id UUID NOT NULL REFERENCES public.operaciones_financieras(id) ON DELETE CASCADE,
    despacho_id UUID REFERENCES public.despachos(id) ON DELETE SET NULL,
    company_id UUID NOT NULL REFERENCES public.companies(id),
    
    -- Datos BCRA
    numero_liquidacion TEXT,
    entidad_financiera TEXT,
    fecha_liquidacion DATE NOT NULL,
    
    -- Montos
    monto_divisa DECIMAL(16,2) NOT NULL,
    moneda_divisa TEXT NOT NULL DEFAULT 'USD',
    tipo_cambio DECIMAL(10,4) NOT NULL,
    monto_pesos DECIMAL(16,2) NOT NULL,
    
    -- Comprobantes
    swift_id UUID REFERENCES public.documentos(id),
    certificado_id UUID REFERENCES public.documentos(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

---------------------------------------------
-- NOTIFICACIONES Y ALERTAS
---------------------------------------------

-- Tipos de notificación
CREATE TYPE public.notificacion_tipo AS ENUM (
    'DOCUMENTO_NUEVO',
    'CAMBIO_ESTADO_DESPACHO',
    'CAMBIO_ESTADO_ENVIO',
    'NUEVA_OBSERVACION',
    'DOCUMENTO_COMPARTIDO',
    'VENCIMIENTO_PROXIMO',
    'APROBACION_REQUERIDA',
    'OTRO'
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tipo public.notificacion_tipo NOT NULL,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    enlace TEXT,
    leida BOOLEAN DEFAULT FALSE,
    fecha_lectura TIMESTAMPTZ,
    entidad_tipo TEXT,
    entidad_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuración de alertas
CREATE TABLE IF NOT EXISTS public.configuracion_alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tipo_alerta TEXT NOT NULL,
    canal TEXT NOT NULL DEFAULT 'email',
    habilitada BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tipo_alerta, canal)
);

---------------------------------------------
-- ÍNDICES
---------------------------------------------

-- Empresas
CREATE INDEX IF NOT EXISTS idx_companies_search ON public.companies USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_companies_identificador_fiscal ON public.companies (identificador_fiscal);

-- Perfiles
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles (company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- User-Companies
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON public.user_companies (user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON public.user_companies (company_id);

-- Despachos
CREATE INDEX IF NOT EXISTS idx_despachos_search ON public.despachos USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_despachos_numero ON public.despachos (numero_despacho);
CREATE INDEX IF NOT EXISTS idx_despachos_company_id ON public.despachos (company_id);
CREATE INDEX IF NOT EXISTS idx_despachos_tipo_estado ON public.despachos (tipo_operacion, estado);
CREATE INDEX IF NOT EXISTS idx_despachos_fecha_oficializacion ON public.despachos (fecha_oficializacion);

-- Documentos
CREATE INDEX IF NOT EXISTS idx_documentos_search ON public.documentos USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_documentos_despacho_id ON public.documentos (despacho_id);
CREATE INDEX IF NOT EXISTS idx_documentos_empresa_id ON public.documentos (empresa_id);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON public.documentos (tipo);

-- Envíos
CREATE INDEX IF NOT EXISTS idx_envios_search ON public.envios USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_envios_despacho_id ON public.envios (despacho_id);
CREATE INDEX IF NOT EXISTS idx_envios_company_id ON public.envios (company_id);
CREATE INDEX IF NOT EXISTS idx_envios_estado ON public.envios (estado);
CREATE INDEX IF NOT EXISTS idx_envios_fechas ON public.envios (fecha_programada, fecha_estimada_entrega);
CREATE INDEX IF NOT EXISTS idx_envios_contenedor ON public.envios (numero_contenedor);

---------------------------------------------
-- TRIGGERS
---------------------------------------------

-- Actualizar timestamp de "updated_at" automáticamente
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con "updated_at"
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_timestamp ON %I;
            CREATE TRIGGER set_timestamp
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION trigger_set_timestamp();
        ', t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

---------------------------------------------
-- PERMISOS Y RLS
---------------------------------------------

-- Función auxiliar para verificar pertenencia a empresa
CREATE OR REPLACE FUNCTION public.user_belongs_to_company(company_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  belongs BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_companies uc
    WHERE uc.user_id = auth.uid() AND uc.company_id = user_belongs_to_company.company_id
  ) INTO belongs;
  
  RETURN belongs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función auxiliar para verificar si es superadmin o admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS en todas las tablas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despachos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despacho_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despacho_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despacho_observaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documento_versiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documento_compartidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envio_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envio_costos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operaciones_financieras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidaciones_divisas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_alertas ENABLE ROW LEVEL SECURITY;

-- Definir políticas para las tablas principales

-- Companies
CREATE POLICY "Admins pueden ver todas las empresas" 
ON public.companies FOR SELECT
TO authenticated
USING (is_admin_user());

CREATE POLICY "Usuarios pueden ver sus empresas" 
ON public.companies FOR SELECT
TO authenticated
USING (user_belongs_to_company(id));

-- Profiles
CREATE POLICY "Admins pueden gestionar todos los perfiles" 
ON public.profiles
TO authenticated
USING (is_admin_user());

CREATE POLICY "Usuarios pueden ver su propio perfil" 
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- User_Companies
CREATE POLICY "Admins pueden gestionar todas las relaciones" 
ON public.user_companies
TO authenticated
USING (is_admin_user());

CREATE POLICY "Usuarios pueden ver sus relaciones" 
ON public.user_companies FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Despachos
CREATE POLICY "Admins pueden gestionar todos los despachos" 
ON public.despachos
TO authenticated
USING (is_admin_user());

CREATE POLICY "Usuarios pueden gestionar despachos de sus empresas" 
ON public.despachos
TO authenticated
USING (user_belongs_to_company(company_id));

-- Documentos
CREATE POLICY "Admins pueden gestionar todos los documentos" 
ON public.documentos
TO authenticated
USING (is_admin_user());

CREATE POLICY "Usuarios pueden gestionar documentos de sus empresas" 
ON public.documentos
TO authenticated
USING (user_belongs_to_company(empresa_id));

CREATE POLICY "Usuarios pueden ver documentos públicos" 
ON public.documentos FOR SELECT
TO authenticated
USING (es_publico = true);

CREATE POLICY "Usuarios pueden ver documentos compartidos con ellos" 
ON public.documentos FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.documento_compartidos dc
    WHERE dc.documento_id = documentos.id
    AND (dc.compartido_con = auth.uid() OR dc.compartido_con_email = (
      SELECT email FROM public.profiles WHERE id = auth.uid()
    ))
  )
);

-- Notificaciones
CREATE POLICY "Usuarios solo ven sus notificaciones" 
ON public.notificaciones
TO authenticated
USING (user_id = auth.uid());

-- Configuración de alertas
CREATE POLICY "Usuarios solo gestionan su configuración de alertas" 
ON public.configuracion_alertas
TO authenticated
USING (user_id = auth.uid());

-- Logs de auditoría
CREATE POLICY "Solo admins pueden ver logs" 
ON public.audit_logs FOR SELECT
TO authenticated
USING (is_admin_user());

---------------------------------------------
-- INSERCIONES INICIALES
---------------------------------------------

-- Insertar permisos base
INSERT INTO public.permissions (id, name, description, module)
VALUES
    ('despachos.view', 'Ver despachos', 'Ver listados y detalles de despachos', 'despachos'),
    ('despachos.create', 'Crear despachos', 'Crear nuevos despachos aduaneros', 'despachos'),
    ('despachos.edit', 'Editar despachos', 'Modificar despachos existentes', 'despachos'),
    ('despachos.delete', 'Eliminar despachos', 'Eliminar despachos del sistema', 'despachos'),
    ('despachos.approve', 'Aprobar despachos', 'Aprobar despachos para procesamiento', 'despachos'),
    
    ('documentos.view', 'Ver documentos', 'Ver documentos y archivos', 'documentos'),
    ('documentos.upload', 'Subir documentos', 'Cargar nuevos documentos', 'documentos'),
    ('documentos.download', 'Descargar documentos', 'Descargar documentos existentes', 'documentos'),
    ('documentos.delete', 'Eliminar documentos', 'Eliminar documentos del sistema', 'documentos'),
    
    ('logistica.view', 'Ver logística', 'Ver información logística', 'logistica'),
    ('logistica.create', 'Crear envíos', 'Crear nuevos envíos', 'logistica'),
    ('logistica.edit', 'Editar envíos', 'Modificar información de envíos', 'logistica'),
    ('logistica.track', 'Seguimiento avanzado', 'Acceso a seguimiento detallado', 'logistica'),
    
    ('financiero.view', 'Ver financiero', 'Ver información financiera', 'financiero'),
    ('financiero.create', 'Crear pagos', 'Registrar pagos y cobros', 'financiero'),
    ('financiero.approve', 'Aprobar operaciones', 'Aprobar operaciones financieras', 'financiero'),
    ('financiero.liquidacion', 'Liquidación divisas', 'Gestionar liquidaciones de divisas', 'financiero'),
    
    ('reportes.basicos', 'Reportes básicos', 'Acceso a reportes básicos', 'reportes'),
    ('reportes.avanzados', 'Reportes avanzados', 'Acceso a reportes avanzados', 'reportes'),
    ('reportes.export', 'Exportar reportes', 'Exportar reportes a Excel/PDF', 'reportes'),
    
    ('admin.users', 'Gestión de usuarios', 'Administrar usuarios', 'admin'),
    ('admin.companies', 'Gestión de empresas', 'Administrar empresas', 'admin'),
    ('admin.permisos', 'Gestión de permisos', 'Administrar permisos', 'admin'),
    ('admin.config', 'Configuración sistema', 'Configurar parámetros del sistema', 'admin'),
    ('admin.logs', 'Ver logs', 'Acceso a logs del sistema', 'admin')
ON CONFLICT (id) DO NOTHING; 