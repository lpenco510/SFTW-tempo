import { supabase } from "./supabase";
import { SUBSCRIPTION_TIERS, USER_ROLES } from "./constants";
import { User } from "@supabase/supabase-js";

type UserWithCustomFields = {
  role?: string;
  subscription?: string;
} & User;

// Extender el tipo de perfil para incluir la propiedad subscription
type ExtendedProfile = {
  id: string;
  role: "operator" | "admin" | "manager" | "viewer";
  subscription?: string;
  // Otras propiedades del perfil...
  company: string;
  created_at: string;
  email: string;
  full_name: string;
  updated_at: string;
};

export async function signIn(email: string, password: string) {
  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (response.data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", response.data.user.id)
      .single();

    if (profile) {
      const extendedProfile = profile as ExtendedProfile;
      (response.data.user as UserWithCustomFields).role = extendedProfile.role;
      (response.data.user as UserWithCustomFields).subscription = extendedProfile.subscription || SUBSCRIPTION_TIERS.FREE;
    }
  }

  return response;
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  companyName: string,
  taxId: string,
  country: string
) {
  try {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error("No se pudo crear el usuario");

    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .insert([
        {
          name: companyName,
          tax_id: taxId,
          country: country,
          settings: {
            logo_url: null,
            direccion: null,
            telefono: null,
            sitio_web: null,
          },
        },
      ])
      .select()
      .single();

    if (companyError) throw companyError;

    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: authData.user.id,
        email,
        full_name: fullName,
        company_id: companyData.id,
        role: USER_ROLES.ADMIN,
        subscription: SUBSCRIPTION_TIERS.FREE,
      },
    ]);

    if (profileError) throw profileError;

    return { user: authData.user, error: null };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error : new Error("Error en el registro"),
    };
  }
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<UserWithCustomFields | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile) {
    const extendedProfile = profile as ExtendedProfile;
    (user as UserWithCustomFields).role = extendedProfile.role;
    (user as UserWithCustomFields).subscription = extendedProfile.subscription || SUBSCRIPTION_TIERS.FREE;
  }

  return user as UserWithCustomFields;
}
