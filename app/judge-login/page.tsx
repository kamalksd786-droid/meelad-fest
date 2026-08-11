"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function JudgeLoginPage() {

  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function login() {

    const { data } = await supabase
      .from("judges")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (!data) {
      alert("Invalid Username or Password");
      return;
    }

    localStorage.setItem(
      "judge",
      JSON.stringify(data)
    );

    router.push("/judge-dashboard");

  }
  return (
  <div className="min-h-screen flex items-center justify-center bg-slate-100">

    <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">

      <h1 className="text-4xl font-bold text-center mb-2">
        👨‍⚖️ Judge Login
      </h1>

      <p className="text-center text-gray-500 mb-8">
        MUNAFASA 2026
      </p>

      <input
        type="text"
        placeholder="Username"
        className="w-full border rounded-lg p-3 mb-4"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full border rounded-lg p-3 mb-6"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={login}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold"
      >
        🔐 Login
      </button>

    </div>

  </div>
);
}