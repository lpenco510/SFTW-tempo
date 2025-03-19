import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Validación de variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

// Cliente tipado de Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'IT-CARGO'
    }
  }
});

// Helpers para manejo de errores
export class SupabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export async function handleSupabaseError<T>(
  promise: Promise<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await promise;
  
  if (error) {
    console.error('Supabase Error:', error);
    throw new SupabaseError(
      error.message || 'An unexpected error occurred',
      error.code
    );
  }
  
  if (!data) {
    throw new SupabaseError('No data returned from Supabase');
  }
  
  return data;
}

// Tipos comunes
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ImportExport = Database['public']['Tables']['import_export']['Row'];

// Cache helper
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }

  const data = await fetcher();
  cache.set(key, { data, timestamp: now });
  return data;
}

// RLS Policies Helper
export async function checkRLSPolicy(
  table: string,
  operation: 'select' | 'insert' | 'update' | 'delete'
): Promise<boolean> {
  try {
    // Usar el tipo any para evitar el error de tipado con RPC
    const { data, error } = await (supabase as any).rpc('check_policy', {
      table_name: table,
      operation_name: operation
    });
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Policy check failed:', error);
    return false;
  }
}

// Storage helpers
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    throw new SupabaseError(`Error uploading file: ${error.message}`);
  }

  return data.path;
}

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
