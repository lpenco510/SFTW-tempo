import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, getTableColumns } from '@/lib/supabase';
import { getCurrentUser, isGuestUser, signOut } from '@/lib/auth';
import { UserWithCustomFields } from '@/types/auth';
import { useRouter } from '@/hooks/useRouter';
// Importar correctamente para evitar conflictos
import useAuth from '@/hooks/useAuth';

// Define types
interface User extends UserWithCustomFields {
  id: string;
  email: string;
  isVerified?: boolean;
}

type UserSettings = {
  theme: string;
  dashboard_layout: any;
  favorite_features: string[];
  notifications_config: any;
};

type Company = {
  id: string;
  name: string;
  nombre_empresa?: string;
  tax_id: string;
  rut?: string;
  country: string;
  settings: any;
  logo_url?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  userSettings: UserSettings | null;
  currentCompany: Company | null;
  companies: Company[];
  setCurrentCompany: (company: Company) => void;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  isVerified: boolean;
  isPendingVerification: boolean;
};

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userSettings: null,
  currentCompany: null,
  companies: [],
  setCurrentCompany: () => {},
  logout: async () => {},
  refreshUserData: async () => {},
  isVerified: false,
  isPendingVerification: false,
});

// Context provider component 
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const router = useRouter();
  
  // Configuración de usuario
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  
  // Empresas asociadas al usuario
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  
  // Estado para controlar reintentos
  const [fetchAttempts, setFetchAttempts] = useState(0);

  // Función para obtener empresas con manejo inteligente de columnas
  const loadCompanies = async (userId: string): Promise<Company[]> => {
    try {
      console.log('AuthProvider: Cargando empresas para el usuario:', userId);
      
      // Obtener columnas de la tabla companies con la función helper
      const companyColumns = await getTableColumns('companies');
      console.log('AuthProvider: Columnas disponibles en companies:', companyColumns);
      
      // Determinar nombres de columnas basados en lo que existe en la tabla
      const columnExists = (name: string): boolean => companyColumns.includes(name);
      
      // Usar name por defecto si nombre_empresa no existe
      const nameColumn = columnExists('nombre_empresa') ? 'nombre_empresa' : 'name';
      
      // Usar tax_id por defecto
      const taxColumn = columnExists('tax_id') ? 'tax_id' : 
                      columnExists('rut') ? 'rut' : 'identificador_fiscal';
      
      console.log(`AuthProvider: Usando columnas: nombre=${nameColumn}, tax=${taxColumn}`);
      
      // Verificar si la tabla user_companies existe
      const userCompanyColumns = await getTableColumns('user_companies');
      
      let userCompanies;
      let companiesError;
      
      if (userCompanyColumns.length > 0) {
        // Si existe la tabla user_companies, obtener empresas asociadas
        const result = await supabase
          .from('user_companies')
          .select(`
            company_id,
            user_role,
            companies (
              id, 
              ${nameColumn},
              ${taxColumn},
              country,
              logo_url,
              settings
            )
          `)
          .eq('user_id', userId);
          
        userCompanies = result.data;
        companiesError = result.error;
      } else {
        // Si no existe user_companies, obtener todas las empresas directamente
        console.log('AuthProvider: Tabla user_companies no encontrada, obteniendo empresas directamente');
        
        const result = await supabase
          .from('companies')
          .select('*');
          
        // Transformar el resultado para mantener la misma estructura
        userCompanies = result.data?.map(company => ({
          company_id: company.id,
          user_role: 'admin',
          companies: company
        })) || [];
        
        companiesError = result.error;
      }
      
      if (companiesError) {
        console.error('Error al cargar empresas del usuario:', companiesError);
        return [];
      }
      
      if (!userCompanies || userCompanies.length === 0) {
        console.log('No se encontraron empresas asociadas al usuario');
        return [];
      }
      
      // Transformar datos con manejo de campos nulos o indefinidos
      const formattedCompanies: Company[] = userCompanies
        .filter(uc => uc.companies) // Filtrar nulos
        .map(uc => {
          const companyData = uc.companies;
          
          // Usar el operador de encadenamiento opcional y valor por defecto
          return {
            id: companyData.id,
            name: companyData[nameColumn] || companyData.name || 'Sin nombre',
            nombre_empresa: companyData[nameColumn] || companyData.name || 'Sin nombre',
            tax_id: companyData[taxColumn] || companyData.tax_id || '',
            rut: companyData[taxColumn] || companyData.tax_id || '',
            country: companyData.country || 'Argentina',
            settings: companyData.settings || {},
            logo_url: companyData.logo_url || '/IT CARGO - GLOBAL - toditos-17.png'
          };
        });
      
      console.log(`AuthProvider: Se cargaron ${formattedCompanies.length} empresas correctamente`);
      return formattedCompanies;
    } catch (error) {
      console.error('Error crítico cargando empresas:', error);
      
      // Si falla todo, devolver una empresa por defecto para evitar bloquear la aplicación
      const defaultCompany: Company = {
        id: 'default-company',
        name: 'Empresa por defecto',
        nombre_empresa: 'Empresa por defecto',
        tax_id: '00-00000000-0',
        rut: '00-00000000-0',
        country: 'Argentina',
        settings: {},
        logo_url: '/IT CARGO - GLOBAL - toditos-17.png'
      };
      
      console.log('AuthProvider: Usando empresa por defecto debido a errores');
      return [defaultCompany];
    }
  };

  const fetchUserDetails = async () => {
    try {
      console.log("AuthProvider: Iniciando fetchUserDetails, intento #", fetchAttempts + 1);
      
      // Verificar guest first
      const guest = await isGuestUser();
      
      if (guest) {
        console.log("AuthProvider: Usuario invitado detectado");
        const guestUserStr = localStorage.getItem('guestUser');
        if (guestUserStr) {
          try {
            const guestUser = JSON.parse(guestUserStr) as User;
            setUser(guestUser);
            setIsVerified(false);
            setIsPendingVerification(false);
            
            console.log("AuthProvider: Datos de usuario invitado cargados correctamente");
            
            // Configurar empresa para invitado
            const guestCompany: Company = {
              id: 'guest-company',
              name: guestUser.user_metadata?.company_name || 'Invitado',
              nombre_empresa: guestUser.user_metadata?.company_name || 'Invitado',
              tax_id: '00-00000000-0',
              rut: '00-00000000-0',
              country: 'Argentina',
              settings: {},
              logo_url: guestUser.user_metadata?.company_logo || '/IT CARGO - GLOBAL - toditos-17.png'
            };
            
            setCompanies([guestCompany]);
            setCurrentCompany(guestCompany);
            
            // Settings básicos para invitado
            setUserSettings({
    theme: 'light',
              dashboard_layout: {},
              favorite_features: [],
              notifications_config: {}
            });
            
            setLoading(false);
            return;
          } catch (parseError) {
            console.error("Error al procesar datos de usuario invitado:", parseError);
            // Si falla el parsing, limpiamos localStorage y continuamos como no invitado
            localStorage.removeItem('guestUser');
          }
        }
      } else {
        console.log("AuthProvider: No es usuario invitado, verificando sesión");
        
        // Intentar obtener sesión explícitamente primero
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("AuthProvider: Error obteniendo sesión", sessionError);
          throw sessionError;
        }
        
        if (!sessionData.session) {
          console.log("AuthProvider: No se encontró sesión activa");
          setUser(null);
          setCompanies([]);
          setCurrentCompany(null);
          setIsVerified(false);
          setIsPendingVerification(false);
          setLoading(false);
          return;
        }
        
        console.log("AuthProvider: Sesión encontrada, obteniendo datos del usuario");
        
        // Usuario autenticado
        const userData = await getCurrentUser();
        console.log("AuthProvider: Usuario actual", userData?.id);
        
        if (!userData) {
          console.log("AuthProvider: No se pudo obtener datos del usuario a pesar de tener sesión");
          setUser(null);
          setCompanies([]);
          setCurrentCompany(null);
          setIsVerified(false);
          setIsPendingVerification(false);
          setLoading(false);
          return;
        }
        
        // Establecer banderas de verificación
        const verified = !!userData.isVerified;
        setIsVerified(verified);
        setIsPendingVerification(!verified && !userData.isGuest);
        
        setUser(userData as User);
        
        // Si el usuario está verificado, cargar sus empresas con la nueva función
        if (verified) {
          try {
            const userCompanies = await loadCompanies(userData.id);
            setCompanies(userCompanies);
            
            // Establecer empresa actual si hay alguna
            if (userCompanies.length > 0) {
              setCurrentCompany(userCompanies[0]);
            }
          } catch (companyError) {
            console.error("Error cargando empresas:", companyError);
            // Continuar sin empresas
            setCompanies([]);
            setCurrentCompany(null);
          }
        } else {
          // Usuario no verificado o invitado, configurar valores por defecto
          setCompanies([]);
          setCurrentCompany(null);
        }
      }
    } catch (error) {
      console.error('AuthProvider: Error en la carga de datos de usuario:', error);
      
      // Si hay un error y no hemos intentado demasiadas veces, reintentamos
      if (fetchAttempts < 2) {
        console.log(`AuthProvider: Reintentando carga (${fetchAttempts + 1}/3)`);
        setFetchAttempts(prev => prev + 1);
        
        // Pequeño retraso antes de reintentar
        setTimeout(() => {
          fetchUserDetails();
        }, 1000);
        return;
      } else {
        // Después de varios intentos, asumimos que no hay usuario
        console.log("AuthProvider: Demasiados intentos fallidos, considerando no autenticado");
        setUser(null);
        setCompanies([]);
        setCurrentCompany(null);
      }
    } finally {
      // Solo cambiamos loading a false si es el último intento o si tuvimos éxito
      if (fetchAttempts >= 2 || user !== null) {
        setLoading(false);
        console.log("AuthProvider: Finalizada carga de datos de usuario");
      }
    }
  };
  
  // Función para actualizar datos del usuario con forzado
  const refreshUserData = async () => {
    try {
      console.log("AuthProvider: Iniciando refreshUserData");
      setLoading(true);
      // Restablecer el contador de intentos
      setFetchAttempts(0);
      await fetchUserDetails();
    } catch (error) {
      console.error("AuthProvider: Error al refrescar datos:", error);
      setLoading(false);
    }
  };
  
  // Función de logout
  const logout = async () => {
    await signOut();
    localStorage.removeItem('guestUser');
    setUser(null);
    setCompanies([]);
    setCurrentCompany(null);
    setIsVerified(false);
    setIsPendingVerification(false);
    
    // Redirigir al login
    router.navigate('/login');
  };

  // Efecto para cargar datos iniciales con tiempo máximo
  useEffect(() => {
    fetchUserDetails();
    
    // Configurar un tiempo máximo para el estado de carga
    const maxLoadingTimer = setTimeout(() => {
      if (loading) {
        console.log("AuthProvider: Forzando finalización de carga después de tiempo máximo");
        setLoading(false);
      }
    }, 5000); // 5 segundos como máximo para la carga inicial
    
    // Configurar listener de cambios de estado de auth
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'INITIAL_SESSION') {
        // Nada que hacer, se maneja con fetchUserDetails
      } else if (event === 'SIGNED_IN') {
        // Usuario acaba de iniciar sesión
        await fetchUserDetails();
      } else if (event === 'SIGNED_OUT') {
        // Usuario cerró sesión, limpiar estado
        setUser(null);
        setCompanies([]);
        setCurrentCompany(null);
        setIsVerified(false);
        
        // También limpiamos cualquier dato de usuario invitado
        localStorage.removeItem('guestUser');
        sessionStorage.removeItem('guestUser');
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(maxLoadingTimer);
    };
  }, []);

  // Context value
  const value = {
    user,
    loading,
    userSettings,
    currentCompany,
    companies,
    setCurrentCompany,
    logout,
    refreshUserData,
    isVerified,
    isPendingVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Export the imported hook instead of the local implementation
// export const useAuth = importedUseAuth;
