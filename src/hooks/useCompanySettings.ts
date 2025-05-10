'use client'

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

// Type definitions
export interface CompanySettings {
  id?: string;
  name?: string;
  nombre_empresa?: string;
  tax_id?: string;
  direccion?: string;
  telefono?: string;
  sitio_web?: string;
  logo_url?: string;
  rut?: string;
  country?: string;
  settings?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

/**
 * Hook for managing company settings
 */
export function useCompanySettings() {
  const { user, loading: isAuthLoading } = useAuth();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize company data to ensure consistent structure
  const normalizeCompanyData = useCallback((data: any): CompanySettings => {
    return {
      id: data?.id || '',
      name: data?.name || '',
      nombre_empresa: data?.nombre_empresa || data?.name || '',
      tax_id: data?.tax_id || data?.rut || '',
      rut: data?.rut || data?.tax_id || '',
      direccion: data?.direccion || (data?.settings?.direccion) || '',
      telefono: data?.telefono || (data?.settings?.telefono) || '',
      sitio_web: data?.sitio_web || (data?.settings?.sitio_web) || '',
      logo_url: data?.logo_url || (data?.settings?.logo_url) || '',
      country: data?.country || '',
      settings: data?.settings || {},
      created_at: data?.created_at || '',
      updated_at: data?.updated_at || ''
    };
  }, []);

  // Fetch company data
  const fetchCompanyData = useCallback(async () => {
    if (isAuthLoading) return;
    if (!user) {
      setIsLoading(false);
              return;
            }

    setIsLoading(true);
    setError(null);

    try {
      // If user is in guest mode, return guest company data
      if (user.isGuest) {
        const guestCompany = {
          id: 'guest-company',
          nombre_empresa: user.nombreEmpresa || 'Empresa de Invitado',
          tax_id: user.identificadorFiscal || 'GUEST123',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setSettings(normalizeCompanyData(guestCompany));
        setIsLoading(false);
        return;
      }
      
      // Otherwise fetch from Supabase
      const companyId = user.companyId;
      if (!companyId) {
        throw new Error('ID de empresa no encontrado');
      }

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      
      setSettings(normalizeCompanyData(data));
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar datos de la empresa');
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthLoading, normalizeCompanyData]);

  // Update company settings
  const updateCompanySettings = useCallback(async (updatedSettings: Partial<CompanySettings>) => {
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    if (user.isGuest) {
      toast.error('No se pueden guardar configuraciones en modo invitado');
      return { success: false, error: 'Funcionalidad no disponible en modo invitado' };
    }

    setIsSaving(true);
    setError(null);

    try {
      const companyId = user.companyId;
      if (!companyId) {
        throw new Error('ID de empresa no encontrado');
      }

      // Remove any undefined values and ensure we only use columns that exist in the database
      const validColumns = [
        'id', 'name', 'nombre_empresa', 'tax_id', 'direccion', 'telefono', 
        'sitio_web', 'logo_url', 'country', 'settings', 'created_at', 'updated_at'
      ];
      
      const cleanSettings = Object.fromEntries(
        Object.entries(updatedSettings)
          .filter(([key, value]) => value !== undefined && validColumns.includes(key))
      );

      // Add updated_at timestamp
      const dataToUpdate = {
        ...cleanSettings,
        updated_at: new Date().toISOString()
      };

      console.log('Updating company with data:', dataToUpdate);

      const { data, error } = await supabase
        .from('companies')
        .update(dataToUpdate)
        .eq('id', companyId)
        .select()
        .single();

      if (error) throw error;

      setSettings(normalizeCompanyData(data));
      toast.success('Configuración de empresa actualizada');
      return { success: true, data };
    } catch (err) {
      console.error('Error updating company settings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar configuración';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [user, normalizeCompanyData]);

  // Upload company logo
  const uploadLogo = useCallback(async (file: File) => {
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    if (user.isGuest) {
      toast.error('No se pueden guardar archivos en modo invitado');
      return { success: false, error: 'Funcionalidad no disponible en modo invitado' };
    }

    try {
      const companyId = user.companyId;
      if (!companyId) {
        throw new Error('ID de empresa no encontrado');
      }

      // Check file type and size
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
        throw new Error('Formato de archivo no soportado. Use JPG, PNG, GIF o WebP');
      }
      
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        throw new Error('El archivo excede el tamaño máximo de 2MB');
      }

      // Create a unique file name with timestamp to prevent caching issues
      const timestamp = Date.now();
      const fileName = `logo_${companyId}_${timestamp}.${fileExt}`;
      
      // The bucket "company-logos" exists in your Supabase storage (verified via SQL query)
      const bucketName = 'company-logos';
      
      // Upload to the company-logos bucket
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading to storage:', uploadError);
        throw new Error(`Error al subir imagen: ${uploadError.message}`);
      }

      // Get the public URL
      const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      // Update company settings with the new logo URL
      console.log('Updating company with logo URL:', publicUrl);
      const updateResult = await updateCompanySettings({ logo_url: publicUrl });
      
      if (!updateResult.success) {
        throw new Error(`Error al actualizar la configuración: ${updateResult.error}`);
      }
      
      return { success: true, url: publicUrl };
    } catch (err) {
      console.error('Error uploading logo:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al subir el logo';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user, updateCompanySettings]);

  // Load company data when user changes
  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  return {
    settings,
    isLoading,
    isSaving,
    error,
    updateCompanySettings,
    uploadLogo,
    refreshData: fetchCompanyData
  };
}

// For backward compatibility
export default useCompanySettings;
