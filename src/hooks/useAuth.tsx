import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { supabase, clearQueryCache } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

// Almacenamiento para datos de usuario en memoria
const userCache = {
  currentUser: null as any,
  lastCheck: 0,
  isFetching: false
};

export type User = {
  id: string;
  email: string;
  nombreEmpresa?: string;
  identificadorFiscal?: string;
  isAdmin?: boolean;
  companyId?: string;
  role?: string;
  createdAt?: string;
  isGuest?: boolean;
  isVerified?: boolean;
};

export function isGuestUser() {
  try {
    const guestData = localStorage.getItem("guest_user");
    // Validar que los datos sean objeto JSON válido
    if (guestData) {
      try {
        const parsed = JSON.parse(guestData);
        // Verificar que tiene propiedades mínimas necesarias
        return !!(parsed && parsed.id && parsed.email && parsed.isGuest === true);
      } catch (e) {
        console.error("Error al parsear datos de invitado, eliminando datos corruptos:", e);
        localStorage.removeItem("guest_user");
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error("Error al verificar usuario invitado:", error);
    return false;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  // Devolver del caché si fue revisado hace menos de 10 segundos
  if (userCache.currentUser && (Date.now() - userCache.lastCheck < 10000)) {
    return userCache.currentUser;
  }

  try {
    // Si ya hay una petición en curso, esperar a que termine
    if (userCache.isFetching) {
      // Esperar a que termine la petición actual (máximo 2 segundos)
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (!userCache.isFetching) {
            clearInterval(checkInterval);
            resolve(null);
          }
        }, 100);
        
        // Poner un timeout para no quedar en espera indefinida
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(null);
        }, 2000);
      });
      
      return userCache.currentUser;
    }
    
    userCache.isFetching = true;
    
    // Comprobar primero si es usuario invitado
    if (isGuestUser()) {
      console.log("getCurrentUser: Usuario invitado");
      const guestData = localStorage.getItem("guest_user");
      
      try {
        const parsedGuest = JSON.parse(guestData || "{}");
        
        // Asegurar que todos los campos necesarios estén presentes
        const guestUser: User = {
          id: parsedGuest.id || `guest-${Date.now()}`,
          email: parsedGuest.email || `guest-${Date.now()}@example.com`,
          nombreEmpresa: parsedGuest.nombreEmpresa || "Empresa Invitada",
          identificadorFiscal: parsedGuest.identificadorFiscal || "GUEST-ID",
          isAdmin: false,
          companyId: parsedGuest.companyId || `guest-company-${Date.now()}`,
          role: "guest",
          isGuest: true,
          isVerified: true
        };
        
        userCache.currentUser = guestUser;
        userCache.lastCheck = Date.now();
        userCache.isFetching = false;
        
        console.log("getCurrentUser: Usuario invitado recuperado correctamente", guestUser);
        return guestUser;
      } catch (e) {
        console.error("Error al parsear datos de invitado:", e);
        // Limpiar localStorage corrupto
        localStorage.removeItem("guest_user");
        userCache.isFetching = false;
        return null;
      }
    }

    // Obtener sesión de Supabase
    console.log("getCurrentUser: Consultando sesión de Supabase");
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error al obtener sesión:", error);
      userCache.isFetching = false;
      return null;
    }

    if (!session) {
      console.log("getCurrentUser: No hay sesión activa");
      userCache.currentUser = null;
      userCache.lastCheck = Date.now();
      userCache.isFetching = false;
      return null;
    }

    // Obtener datos del usuario
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (userError) {
      console.error("Error al obtener datos del usuario:", userError);
      userCache.isFetching = false;
      return null;
    }

    // Obtener datos de la empresa si el usuario tiene empresa asociada
    let companyData = null;
    if (userData?.company_id) {
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", userData.company_id)
        .single();

      if (companyError) {
        console.error("Error al obtener datos de la empresa:", companyError);
      } else {
        companyData = company;
      }
    }

    // Construir objeto de usuario con datos combinados
    const user: User = {
      id: session.user.id,
      email: session.user.email || "",
      nombreEmpresa: companyData?.nombre_empresa || companyData?.name || "",
      identificadorFiscal: companyData?.tax_id || companyData?.rut || "",
      isAdmin: userData?.role === "admin",
      companyId: userData?.company_id || null,
      role: userData?.role || "user",
      createdAt: userData?.created_at,
      isGuest: false,
      isVerified: true // Por ahora asumimos verificados a todos los usuarios normales
    };

    userCache.currentUser = user;
    userCache.lastCheck = Date.now();
    userCache.isFetching = false;
    
    return user;
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    userCache.isFetching = false;
    return null;
  }
}

// Definir el contexto para la autenticación
export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, nombreEmpresa: string, identificadorFiscal: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  checkUser: () => Promise<User | null>;
  useGuestMode: (nombreEmpresa: string) => Promise<{ data: any; error: any }>;
  isGuestUser: () => boolean;
  saveLastRoute: (path: string) => void;
  getLastRoute: () => string;
  refreshUserData: () => Promise<User | null>;
  isVerified: boolean;
  isPendingVerification: boolean;
  currentCompany?: {
    nombre?: string;
    nombre_empresa?: string;
    id?: string;
    tax_id?: string;
  };
};

// Crear el contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// HOOK PERSONALIZADO PARA USAR EL CONTEXTO
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

// Definir el proveedor de autenticación
type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const navigate = useNavigate();

  const checkUser = useCallback(async () => {
    setLoading(true);
    const user = await getCurrentUser();
    setUser(user);
    
    // Actualizar estados de verificación
    if (user) {
      setIsVerified(!!user.isVerified);
      setIsPendingVerification(!user.isVerified && !user.isGuest);
    } else {
      setIsVerified(false);
      setIsPendingVerification(false);
    }
    
    setLoading(false);
    return user;
  }, []);

  // Alias de checkUser para compatibilidad
  const refreshUserData = useCallback(async () => {
    return checkUser();
  }, [checkUser]);

  // Función para guardar la última ruta visitada
  const saveLastRoute = useCallback((path: string) => {
    try {
      if (path && path !== '/login' && path !== '/register' && !path.startsWith('/reset-password')) {
        localStorage.setItem('lastVisitedRoute', path);
      }
    } catch (error) {
      console.error('Error al guardar la última ruta:', error);
    }
  }, []);

  // Función para obtener la última ruta visitada
  const getLastRoute = useCallback(() => {
    try {
      return localStorage.getItem('lastVisitedRoute') || '/dashboard';
    } catch (error) {
      console.error('Error al obtener la última ruta:', error);
      return '/dashboard';
    }
  }, []);

  // Función para iniciar sesión
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          throw error;
        }

        // Limpiar caché cuando un usuario inicia sesión
        clearQueryCache();
        
        await checkUser();
        return { data, error: null };
      } catch (error: any) {
        console.error("Error al iniciar sesión:", error);
        return { data: null, error };
      } finally {
        setLoading(false);
      }
    },
    [checkUser]
  );

  // Función para registrar un nuevo usuario
  const signUp = useCallback(
    async (email: string, password: string, nombreEmpresa: string, identificadorFiscal: string) => {
      try {
        setLoading(true);
        console.log("Iniciando proceso de registro para:", email, "con empresa:", nombreEmpresa);
        
        // Registrar usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password
        });

        if (authError) {
          console.error("Error en autenticación durante registro:", authError);
          throw authError;
        }

        if (!authData.user || !authData.user.id) {
          console.error("No se pudo crear el usuario o no se recibió ID");
          throw new Error("Error al crear cuenta: No se recibió ID de usuario");
        }

        console.log("Usuario creado exitosamente, ID:", authData.user.id);

        // Crear empresa en la base de datos con todos los campos requeridos
        console.log("Intentando crear empresa:", nombreEmpresa);
        try {
          // Primero verificar si la tabla user_companies existe
          const { data: companyData, error: companyError } = await supabase
            .from("companies")
            .insert([
              {
                // Campos obligatorios
                name: nombreEmpresa,
                nombre_empresa: nombreEmpresa,
                tax_id: identificadorFiscal,
                rut: identificadorFiscal,
                country: "AR", // País por defecto: Argentina
                settings: {}, // Objeto vacío para el campo JSON
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
            .select()
            .single();

          if (companyError) {
            console.error("Error al crear empresa:", companyError);
            throw new Error(`Error al crear empresa: ${companyError.message}`);
          }

          console.log("Empresa creada exitosamente, ID:", companyData.id);
          
          // Crear relación en user_companies antes de actualizar profile
          console.log("Creando relación en user_companies");
          const { error: relationError } = await supabase
            .from("user_companies")
            .insert([
              {
                user_id: authData.user.id,
                company_id: companyData.id,
                role: "ADMIN",
                is_primary: true,
                created_at: new Date().toISOString()
              }
            ]);
            
          if (relationError) {
            console.error("Error al crear relación usuario-empresa:", relationError);
            throw new Error(`Error al asociar usuario con empresa: ${relationError.message}`);
          }

          // Asociar usuario a la empresa creada actualizando su perfil
          console.log("Actualizando perfil del usuario con ID de empresa");
          const { error: userError } = await supabase
            .from("profiles")
            .update({
              company_id: companyData.id,
              company_name: nombreEmpresa,
              role: "admin"
            })
            .eq("id", authData.user.id);

          if (userError) {
            console.error("Error al actualizar perfil de usuario:", userError);
            throw new Error(`Error al actualizar perfil: ${userError.message}`);
          }

          console.log("Registro completado exitosamente");
          return { data: authData, error: null };
        } catch (error: any) {
          console.error("Error al procesar empresa:", error);
          throw error;
        }
      } catch (error: any) {
        console.error("Error en el proceso de registro:", error);
        return { 
          data: null, 
          error: {
            message: error.message || "Error en el proceso de registro. Por favor, contacte a soporte."
          }
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Función para cerrar sesión
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      saveLastRoute(window.location.pathname);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Limpiar caché después de cerrar sesión
      userCache.currentUser = null;
      userCache.lastCheck = 0;
      clearQueryCache();
      
      setUser(null);
      navigate("/login");
      
      return { error: null };
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, [navigate, saveLastRoute]);

  // Función para usar modo invitado
  const useGuestMode = async (nombreEmpresa: string) => {
    try {
      setLoading(true);
      
      // Solo permitir modo invitado en ambiente de desarrollo o con flag específico
      const isDev = import.meta.env.DEV || process.env.NODE_ENV === 'development';
      const allowGuestInProd = import.meta.env.VITE_ALLOW_GUEST_MODE === 'true';
      
      if (!isDev && !allowGuestInProd) {
        console.warn('Modo invitado solo disponible en ambiente de desarrollo o con flag habilitado');
        return { error: 'Modo invitado no disponible en este entorno' };
      }

      if (!nombreEmpresa || nombreEmpresa.trim() === '') {
        return { error: 'Se requiere un nombre de empresa para el modo invitado' };
      }

      console.log('Iniciando modo invitado para:', nombreEmpresa);

      try {
        // Limpiar cualquier estado previo de invitado
        localStorage.removeItem('guest_user');
        
        // Crear usuario invitado con ID único
        const guestUserId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const guestUserEmail = `guest_${guestUserId}@example.com`;
        
        // Crear ID de empresa único para el invitado
        const guestCompanyId = `company_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        // Crear objeto de usuario invitado con todos los campos necesarios
        const guestUser = {
          id: guestUserId,
          email: guestUserEmail,
          nombreEmpresa: nombreEmpresa.trim(),
          identificadorFiscal: 'GUEST12345',
          isAdmin: false,
          companyId: guestCompanyId,
          role: 'guest',
          isGuest: true,
          isVerified: true,
          created_at: new Date().toISOString(),
        };

        // Guardar datos del usuario invitado en localStorage
        localStorage.setItem('guest_user', JSON.stringify(guestUser));
        
        // Verificar que se guardó correctamente
        const savedData = localStorage.getItem('guest_user');
        if (!savedData) {
          throw new Error('No se pudo guardar el usuario invitado en localStorage');
        }
        
        console.log('Usuario invitado creado correctamente', guestUser);
        
        // Actualizar estado de usuario
        setUser(guestUser);
        setIsVerified(true);
        setIsPendingVerification(false);
        
        // Notificar éxito
        console.log('Modo invitado activado exitosamente');
        return { success: true, user: guestUser };
      } catch (storageError) {
        console.error('Error al guardar usuario invitado:', storageError);
        return { error: 'Error al guardar datos de invitado en localStorage' };
      }
    } catch (error) {
      console.error('Error al crear usuario invitado:', error);
      return { error: 'Error inesperado al crear usuario invitado' };
      } finally {
        setLoading(false);
      }
  };

  // Efecto para escuchar cambios en la autenticación
  useEffect(() => {
    const checkUserAuth = async () => {
      await checkUser();
    };

    checkUserAuth();

    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Evento de autenticación:", event);
        
        if (event === "SIGNED_IN") {
          await checkUser();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsVerified(false);
          setIsPendingVerification(false);
          // Limpiar caché después de cerrar sesión
          userCache.currentUser = null;
          userCache.lastCheck = 0;
          clearQueryCache();
        } else if (event === "USER_UPDATED") {
          await checkUser();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkUser]);

  // Valores a exponer en el contexto
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    checkUser,
    useGuestMode,
    isGuestUser,
    saveLastRoute,
    getLastRoute,
    refreshUserData,
    isVerified,
    isPendingVerification,
    currentCompany: {
      nombre: user?.nombreEmpresa,
      nombre_empresa: user?.nombreEmpresa,
      id: user?.companyId,
      tax_id: user?.identificadorFiscal
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Eliminar la exportación por defecto duplicada
// export default function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth debe ser usado dentro de un AuthProvider");
//   }
//   return context;
// }

// Reemplazamos la exportación duplicada con re-exportación del default
// export const useAuth = () => useContext(AuthContext);

// El export useAuthContext es para compatibilidad con AuthProvider.tsx
// Mantener esto si es necesario en otro lugar, pero ahora usa el useAuth nombrado
// Si no se usa `useAuthContext` en ninguna parte, se puede eliminar también.
// Por ahora, lo comentamos para asegurarnos que no rompa nada más.
// export const useAuthContext = useAuth;

// Asegurar que la exportación por defecto apunte a la función useAuth nombrada
// Esta exportación es crítica para muchos componentes que importan sin llaves
export default useAuth;
