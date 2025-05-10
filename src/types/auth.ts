/**
 * Tipos relacionados con la autenticación
 */

export interface UserWithCustomFields {
  id: string;
  email?: string;
  isVerified?: boolean;
  isPendingVerification?: boolean;
  role?: string;
  company_id?: string;
  user_metadata?: {
    company_name?: string;
    company_logo?: string;
    [key: string]: any;
  };
  isGuest?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}
