'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface CompanySettings {
  id: string;
  name: string;
  tax_id: string;
  country: string;
  settings: {
    logo_url?: string;
    direccion?: string;
    telefono?: string;
    sitio_web?: string;
  };
  logo_url?: string;
  direccion?: string;
  telefono?: string;
  sitio_web?: string;
  nombre_empresa?: string;
  rut?: string;
}

export const useCompanySettings = () => {
  const defaultSettings: CompanySettings = {
    id: '',
    name: "",
    tax_id: '',
    country: '',
    settings: {
      logo_url: "/arusa-logo.webp",
    }
  };

  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoVersion, setLogoVersion] = useState(Date.now());

  const optimizeImage = async (file: File): Promise<File> => {
    const image = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const blob = URL.createObjectURL(file);
    
    return new Promise((resolve, reject) => {
      image.onload = () => {
        const maxWidth = 1000;
        const maxHeight = 1000;
        
        let width = image.width;
        let height = image.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(image, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al optimizar la imagen'));
              return;
            }
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.8
        );
      };
      
      image.onerror = () => reject(new Error('Error al cargar la imagen'));
      image.src = blob;
    });
  };

  const fetchCompanySettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('Debug: No user found');
        return;
      }
  
      // Obtener el perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }
  
      // Obtener las compañías asociadas al usuario
      const { data: userCompanies, error: userCompaniesError } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id);

      if (userCompaniesError) {
        console.error('Error fetching user companies:', userCompaniesError);
        return;
      }

      if (userCompanies && userCompanies.length > 0) {
        const companyId = userCompanies[0].company_id;
        
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();
  
        if (companyError) throw companyError;
        
        if (company) {
          // Asegurarse de que settings sea un objeto
          const companySettings = typeof company.settings === 'object' && company.settings !== null 
            ? company.settings 
            : {};
            
          const mergedSettings = {
            ...company,
            settings: {
              ...companySettings,
              logo_url: company.logo_url || (companySettings as any)?.logo_url
            }
          };
          
          setSettings(mergedSettings);
          setLogoVersion(Date.now());
        }
      }
    } catch (err) {
      console.error('Debug: Error in fetchCompanySettings:', err);
    } finally {
      setLoading(false);
    }
  };  
  
    const emitCompanyUpdate = () => {
      window.dispatchEvent(new CustomEvent('company-updated'));
    };
    
    const updateCompanyName = async (newName: string) => {
      try {
        if (!settings.id) throw new Error('No hay empresa seleccionada');

        const { error } = await supabase
          .from('companies')
          .update({ name: newName })
          .eq('id', settings.id);

        if (error) throw error;

        // Refresh entire company data
        await fetchCompanySettings();
        emitCompanyUpdate();
      
        return true;
      } catch (err) {
        console.error('Error updating company name:', err);
        throw err;
      }
    };

    const updateCompanyLogo = async (file: File) => {
        try {
          if (!settings.id) throw new Error('No hay empresa seleccionada');
      
          // Use consistent filename for overwriting
          const fileExt = file.name.split('.').pop();
          const fileName = `company_${settings.id}.${fileExt}`;
          
          const optimizedFile = await optimizeImage(file);
      
          // Upload new logo, overwriting any existing file
          const { error: uploadError } = await supabase.storage
            .from('company-logos')
            .upload(fileName, optimizedFile, {
              cacheControl: '0',
              upsert: true // Forces overwrite
            });
      
          if (uploadError) throw uploadError;
      
          const { data: publicUrl } = supabase.storage
            .from('company-logos')
            .getPublicUrl(fileName);
      
          // Update company with new logo URL and version
          const timestamp = Date.now();
          const { error: updateError } = await supabase
            .from('companies')
            .update({ 
              logo_url: `${publicUrl.publicUrl}?v=${timestamp}`,
              settings: {
                ...settings.settings,
                logo_url: `${publicUrl.publicUrl}?v=${timestamp}`
              }
            })
            .eq('id', settings.id);
      
          if (updateError) throw updateError;
      
          setLogoVersion(timestamp);
          await fetchCompanySettings();
          window.dispatchEvent(new CustomEvent('company-updated'));
      
          return publicUrl.publicUrl;
        } catch (err) {
          console.error('Error updating company logo:', err);
          throw err;
        }
      };
      
  const updateCompanySettings = async (newSettings: Partial<CompanySettings['settings']>) => {
    try {
      if (!settings.id) throw new Error('No hay empresa seleccionada');

      const updatedSettings = {
        ...settings.settings,
        ...newSettings
      };

      const { error } = await supabase
        .from('companies')
        .update({ 
          settings: updatedSettings,
          direccion: newSettings.direccion,
          telefono: newSettings.telefono,
          sitio_web: newSettings.sitio_web
        })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => ({
        ...prev,
        settings: updatedSettings,
        ...newSettings
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración');
      throw err;
    }
  };

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateCompanyLogo,
    updateCompanyName,
    updateCompanySettings,
    refetch: fetchCompanySettings,
    logoVersion
  };
};
