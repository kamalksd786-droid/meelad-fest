"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TeacherLoginPage() {
  const [teacherId, setTeacherId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!teacherId.trim() || !password.trim()) {
      alert("Please enter Teacher ID and Password.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("teacher_id", teacherId.trim())
      .eq("password", password.trim())
      .maybeSingle();

    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      alert("Invalid Teacher ID or Password.");
      setLoading(false);
      return;
    }

    localStorage.setItem("teacherId", String(data.teacher_id));
    localStorage.setItem("teacherName", data.teacher_name || "");

    window.location.href = "/teacher";
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-2">
          👨‍🏫 Teacher Login
        </h1>

        <p className="text-center text-gray-500 mb-6">
          MUNAFASA 2026
        </p>

        <label className="block font-semibold mb-2">
          Teacher ID
        </label>

        <input
          type="text"
          placeholder="Enter Teacher ID"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          className="border rounded-lg w-full p-3 mb-4"
        />

        <label className="block font-semibold mb-2">
          Password
        </label>

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded-lg w-full p-3 mb-6"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              login();
            }
          }}
        />

        <button
          type="button"
          onClick={login}
          disabled={loading}
          className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-bold p-3 rounded-lg"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </div>
    </div>
  );
}