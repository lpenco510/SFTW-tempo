import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type UserSettings = {
  theme: string;
  dashboard_layout: any;
  favorite_features: string[];
  notifications_config: any;
};

type Company = {
  id: string;
  name: string;
  tax_id: string;
  country: string;
  settings: any;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  userSettings: UserSettings | null;
  currentCompany: Company | null;
  companies: Company[];
  setCurrentCompany: (company: Company) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      setUser(user);

      if (user) {
        // Cargar configuraciones del usuario
        const { data: settings } = await supabase
          .from("user_settings")
          .select("*")
          .eq("id", user.id)
          .single();
        setUserSettings(settings);

        // Cargar empresas del usuario
        const { data: userCompanies } = await supabase
          .from("companies")
          .select("*")
          .in(
            "id",
            (
              await supabase
                .from("user_companies")
                .select("company_id")
                .eq("user_id", user.id)
            ).data?.map((uc) => uc.company_id) || [],
          );

        setCompanies(userCompanies || []);
        if (userCompanies?.length > 0) {
          setCurrentCompany(userCompanies[0]);
        }
      }

      setLoading(false);
    };

    loadUserData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userSettings,
        currentCompany,
        companies,
        setCurrentCompany,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
