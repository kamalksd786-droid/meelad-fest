import { supabase } from "@/lib/supabase";

export async function getStudent(id: number) {
  return await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();
}

export async function getProgrammes(category: string) {
  return await supabase
    .from("programmes")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .order("programme_code");
}

export async function getRegistrations(studentId: number) {
  return await supabase
    .from("registrations")
    .select("*")
    .eq("student_id", studentId);
}