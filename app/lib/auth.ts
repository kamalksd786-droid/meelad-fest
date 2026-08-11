import { supabase } from "./supabase";

export async function login(username: string, password: string) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !user) {
    return {
      success: false,
      message: "Invalid Username",
    };
  }

  if (user.password !== password) {
    return {
      success: false,
      message: "Invalid Password",
    };
  }

  return {
    success: true,
    user,
  };
}