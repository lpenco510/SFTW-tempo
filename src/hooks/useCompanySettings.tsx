import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import useAuth from '@/hooks/useAuth';

type CompanySettings = {
  id?: string;
  name?: string;
  nombre_empresa?: string;
  tax_id?: string;
  direccion?: string;
  telefono?: string;
  sitio_web?: string;
  logo_url?: string;
  settings?: Record<string, any>;
  country?: string;
  rut?: string;
};

export default function useCompanySettings() {
  const { user, currentCompany } = useAuth();
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos de empresa
  const fetchCompanyData = useCallback(async (forceRefresh = false) => {
    if (!user || !user.companyId) {
      console.log('useCompanySettings: No se puede cargar, no hay usuario o companyId');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('useCompanySettings: Iniciando carga de datos de empresa');
      
      // Consulta directa a la tabla de empresas
      const { data, error: queryError } = await supabase
        .from('companies')
        .select('id, name, tax_id, direccion, telefono, sitio_web, logo_url, settings, country, rut, nombre_empresa')
        .eq('id', user.companyId)
        .single();
      
      if (queryError) {
        console.error('Error al cargar datos de empresa:', queryError);
        setError(new Error(`Error al cargar datos de empresa: ${queryError.message}`));
        return null;
      }
      
      if (!data) {
        console.error('No se encontraron datos de empresa');
        setError(new Error('No se encontraron datos de empresa'));
        return null;
      }
      
      console.log('useCompanySettings: Datos de empresa cargados:', data);
      
      // Normalize company data to ensure all fields exist
      const normalizedData: CompanySettings = {
        id: data.id,
        name: data.name || data.nombre_empresa || '',
        nombre_empresa: data.nombre_empresa || data.name || '',
        tax_id: data.tax_id || data.rut || '',
        direccion: data.direccion || 
                  (data.settings && typeof data.settings === 'object' ? data.settings.direccion : '') || '',
        telefono: data.telefono || 
                  (data.settings && typeof data.settings === 'object' ? data.settings.telefono : '') || '',
        sitio_web: data.sitio_web || 
                  (data.settings && typeof data.settings === 'object' ? data.settings.sitio_web : '') || '',
        logo_url: data.logo_url || 
                  (data.settings && typeof data.settings === 'object' ? data.settings.logo_url : '') || '',
        settings: data.settings || {},
        country: data.country || '',
        rut: data.rut || data.tax_id || ''
      };
      
      setCompany(normalizedData);
      return normalizedData;
    } catch (err) {
      console.error('Error inesperado al cargar datos de empresa:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido al cargar datos de empresa'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Actualizar datos de empresa
  const updateCompany = useCallback(async (updatedData: Partial<CompanySettings>) => {
    if (!user || !user.companyId || !company) {
      console.error('No hay empresa seleccionada');
      return { error: new Error('No hay empresa seleccionada') };
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      console.log('useCompanySettings: Actualizando datos de empresa:', updatedData);
      
      // Asegurar que tengamos campos consistentes
      const dataToUpdate = {
        ...updatedData,
        // Sincronizar campos duplicados
        name: updatedData.nombre_empresa || updatedData.name || company.name,
        nombre_empresa: updatedData.nombre_empresa || updatedData.name || company.nombre_empresa,
        tax_id: updatedData.tax_id || updatedData.rut || company.tax_id,
        rut: updatedData.rut || updatedData.tax_id || company.rut,
        
        // Actualizar el objeto settings con los campos actualizados
        settings: {
          ...(company.settings || {}),
          ...(updatedData.settings || {}),
          logo_url: updatedData.logo_url || company.logo_url || '',
          direccion: updatedData.direccion || company.direccion || '',
          telefono: updatedData.telefono || company.telefono || '',
          sitio_web: updatedData.sitio_web || company.sitio_web || ''
        }
      };
      
      // Ejecutar la actualización
      const { data, error: updateError } = await supabase
        .from('companies')
        .update(dataToUpdate)
        .eq('id', company.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error al actualizar empresa:', updateError);
        setError(new Error(`Error al actualizar empresa: ${updateError.message}`));
        return { error: updateError };
      }
      
      console.log('useCompanySettings: Datos de empresa actualizados correctamente:', data);
      
      // Actualizar estado local
      setCompany({
        ...company,
        ...dataToUpdate
      });
      
      return { data };
    } catch (err) {
      console.error('Error inesperado al actualizar empresa:', err);
      const error = err instanceof Error ? err : new Error('Error desconocido al actualizar empresa');
      setError(error);
      return { error };
    } finally {
      setIsSaving(false);
    }
  }, [user, company]);

  // Cargar automáticamente al montar
  useEffect(() => {
    if (user && user.companyId) {
      fetchCompanyData();
    }
  }, [user, fetchCompanyData]);

  // Función para actualizar el logo
  const updateCompanyLogo = useCallback(async (file: File) => {
    if (!company || !company.id) {
      return { error: new Error('No hay empresa seleccionada') };
    }
    
    try {
      setIsSaving(true);
      
      // Generar un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `company_${company.id}.${fileExt}`;
      const filePath = `company-logos/${fileName}?v=${Date.now()}`; // Cache buster
      
      // Subir archivo a Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error al subir logo:', uploadError);
        return { error: uploadError };
      }
      
      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(uploadData.path);
      
      // Actualizar registro de empresa con la nueva URL
      return updateCompany({
        logo_url: urlData.publicUrl
      });
    } catch (err) {
      console.error('Error al actualizar logo:', err);
      return { error: err instanceof Error ? err : new Error('Error desconocido al actualizar logo') };
    } finally {
      setIsSaving(false);
    }
  }, [company, updateCompany]);
  
  // Verificar si el usuario es invitado
  const isGuestUser = user?.isGuest === true;

  return {
    company,
    loading,
    error,
    isSaving,
    fetchCompanyData,
    updateCompany,
    updateCompanyLogo,
    isGuestUser
  };
} 
import { supabase } from '@/lib/supabase';
import useAuth from '@/hooks/useAuth';

type CompanySettings = {
  id?: string;
  name?: string;
  nombre_empresa?: string;
  tax_id?: string;
  direccion?: string;
  telefono?: string;
  sitio_web?: string;
  logo_url?: string;
  settings?: Record<string, any>;
  country?: string;
  rut?: string;
};

export default function useCompanySettings() {
  const { user, currentCompany } = useAuth();
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos de empresa
  const fetchCompanyData = useCallback(async (forceRefresh = false) => {
    if (!user || !user.companyId) {
      console.log('useCompanySettings: No se puede cargar, no hay usuario o companyId');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('useCompanySettings: Iniciando carga de datos de empresa');
      
      // Consulta directa a la tabla de empresas
      const { data, error: queryError } = await supabase
        .from('companies')
        .select('id, name, tax_id, direccion, telefono, sitio_web, logo_url, settings, country, rut, nombre_empresa')
        .eq('id', user.companyId)
        .single();
      
      if (queryError) {
        console.error('Error al cargar datos de empresa:', queryError);
        setError(new Error(`Error al cargar datos de empresa: ${queryError.message}`));
        return null;
      }
      
      if (!data) {
        console.error('No se encontraron datos de empresa');
        setError(new Error('No se encontraron datos de empresa'));
        return null;
      }
      
      console.log('useCompanySettings: Datos de empresa cargados:', data);
      
      // Normalize company data to ensure all fields exist
      const normalizedData: CompanySettings = {
        id: data.id,
        name: data.name || data.nombre_empresa || '',
        nombre_empresa: data.nombre_empresa || data.name || '',
        tax_id: data.tax_id || data.rut || '',
        direccion: data.direccion || 
                  (data.settings && typeof data.settings === 'object' ? data.settings.direccion : '') || '',
        telefono: data.telefono || 
                  (data.settings && typeof data.settings === 'object' ? data.settings.telefono : '') || '',
        sitio_web: data.sitio_web || 
                  (data.settings && typeof data.settings === 'object' ? data.settings.sitio_web : '') || '',
        logo_url: data.logo_url || 
                  (data.settings && typeof data.settings === 'object' ? data.settings.logo_url : '') || '',
        settings: data.settings || {},
        country: data.country || '',
        rut: data.rut || data.tax_id || ''
      };
      
      setCompany(normalizedData);
      return normalizedData;
    } catch (err) {
      console.error('Error inesperado al cargar datos de empresa:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido al cargar datos de empresa'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Actualizar datos de empresa
  const updateCompany = useCallback(async (updatedData: Partial<CompanySettings>) => {
    if (!user || !user.companyId || !company) {
      console.error('No hay empresa seleccionada');
      return { error: new Error('No hay empresa seleccionada') };
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      console.log('useCompanySettings: Actualizando datos de empresa:', updatedData);
      
      // Asegurar que tengamos campos consistentes
      const dataToUpdate = {
        ...updatedData,
        // Sincronizar campos duplicados
        name: updatedData.nombre_empresa || updatedData.name || company.name,
        nombre_empresa: updatedData.nombre_empresa || updatedData.name || company.nombre_empresa,
        tax_id: updatedData.tax_id || updatedData.rut || company.tax_id,
        rut: updatedData.rut || updatedData.tax_id || company.rut,
        
        // Actualizar el objeto settings con los campos actualizados
        settings: {
          ...(company.settings || {}),
          ...(updatedData.settings || {}),
          logo_url: updatedData.logo_url || company.logo_url || '',
          direccion: updatedData.direccion || company.direccion || '',
          telefono: updatedData.telefono || company.telefono || '',
          sitio_web: updatedData.sitio_web || company.sitio_web || ''
        }
      };
      
      // Ejecutar la actualización
      const { data, error: updateError } = await supabase
        .from('companies')
        .update(dataToUpdate)
        .eq('id', company.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error al actualizar empresa:', updateError);
        setError(new Error(`Error al actualizar empresa: ${updateError.message}`));
        return { error: updateError };
      }
      
      console.log('useCompanySettings: Datos de empresa actualizados correctamente:', data);
      
      // Actualizar estado local
      setCompany({
        ...company,
        ...dataToUpdate
      });
      
      return { data };
    } catch (err) {
      console.error('Error inesperado al actualizar empresa:', err);
      const error = err instanceof Error ? err : new Error('Error desconocido al actualizar empresa');
      setError(error);
      return { error };
    } finally {
      setIsSaving(false);
    }
  }, [user, company]);

  // Cargar automáticamente al montar
  useEffect(() => {
    if (user && user.companyId) {
      fetchCompanyData();
    }
  }, [user, fetchCompanyData]);

  // Función para actualizar el logo
  const updateCompanyLogo = useCallback(async (file: File) => {
    if (!company || !company.id) {
      return { error: new Error('No hay empresa seleccionada') };
    }
    
    try {
      setIsSaving(true);
      
      // Generar un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `company_${company.id}.${fileExt}`;
      const filePath = `company-logos/${fileName}?v=${Date.now()}`; // Cache buster
      
      // Subir archivo a Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error al subir logo:', uploadError);
        return { error: uploadError };
      }
      
      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(uploadData.path);
      
      // Actualizar registro de empresa con la nueva URL
      return updateCompany({
        logo_url: urlData.publicUrl
      });
    } catch (err) {
      console.error('Error al actualizar logo:', err);
      return { error: err instanceof Error ? err : new Error('Error desconocido al actualizar logo') };
    } finally {
      setIsSaving(false);
    }
  }, [company, updateCompany]);
  
  // Verificar si el usuario es invitado
  const isGuestUser = user?.isGuest === true;

  return {
    company,
    loading,
    error,
    isSaving,
    fetchCompanyData,
    updateCompany,
    updateCompanyLogo,
    isGuestUser
  };
} 