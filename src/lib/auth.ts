import { supabase } from "./supabase";
import { SUBSCRIPTION_TIERS, USER_ROLES } from "./constants";

export async function signIn(email: string, password: string) {
  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (response.data.user) {
    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", response.data.user.id)
      .single();

    if (profile) {
      response.data.user.role = profile.role;
      response.data.user.subscription =
        profile.subscription || SUBSCRIPTION_TIERS.FREE;
    }
  }

  return response;
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  company: string,
) {
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company: company,
      },
    },
  });

  if (signUpError) {
    return { error: signUpError };
  }

  if (!data.user) {
    return { error: new Error("No user returned after signup") };
  }

  // Create profile
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: data.user.id,
      email,
      full_name: fullName,
      company,
      role: USER_ROLES.VIEWER,
      subscription: SUBSCRIPTION_TIERS.FREE,
    },
  ]);

  if (profileError) {
    return { error: profileError };
  }

  return { user: data.user, error: null };
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile) {
    user.role = profile.role;
    user.subscription = profile.subscription || SUBSCRIPTION_TIERS.FREE;
  }

  return user;
}
