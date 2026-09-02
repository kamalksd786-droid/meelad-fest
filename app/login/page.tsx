"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [loginType, setLoginType] = useState<"admin" | "teacher">("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!username.trim() || !password.trim()) {
      alert("Please enter username and password.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username.trim())
      .eq("password", password)
      .eq("status", true)
      .single();

    setLoading(false);

    if (error || !data) {
      alert("Invalid Username or Password");
      return;
    }

    if (data.role !== loginType) {
      alert(
        `This account is not a ${
          loginType === "admin" ? "Admin" : "Teacher"
        } account.`
      );
      return;
    }

    localStorage.setItem("user", JSON.stringify(data));

    if (data.role === "admin") {
      router.push("/dashboard");
    } else if (data.role === "teacher") {
      router.push("/teacher-dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-green-950 flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-[#f5f0df] rounded-3xl shadow-2xl p-8">

        {/* HEADER */}

        <div className="text-center mb-8">

          <div className="text-5xl mb-3">
            🏫
          </div>

          <h1 className="text-3xl font-bold text-green-950">
            MUNAFASA 2026
          </h1>

          <p className="text-green-800 mt-2 font-medium">
            THE GLOBAL PUBLIC SHOOL 
          </p>

          <p className="text-gray-600 mt-1">
            Login Portal
          </p>

        </div>

        {/* PORTAL BUTTONS */}

        <div className="grid grid-cols-3 gap-3 mb-7">

          {/* ADMIN */}

          <button
            type="button"
            onClick={() => setLoginType("admin")}
            className={`p-3 rounded-xl font-bold transition ${
              loginType === "admin"
                ? "bg-green-800 text-white shadow-lg"
                : "bg-white text-green-900 hover:bg-green-100"
            }`}
          >
            <span className="text-2xl">👑</span>
            <br />
            Admin
          </button>

          {/* TEACHER */}

          <button
            type="button"
            onClick={() => setLoginType("teacher")}
            className={`p-3 rounded-xl font-bold transition ${
              loginType === "teacher"
                ? "bg-green-800 text-white shadow-lg"
                : "bg-white text-green-900 hover:bg-green-100"
            }`}
          >
            <span className="text-2xl">👨‍🏫</span>
            <br />
            Teacher
          </button>

          {/* PARENT */}

          <button
            type="button"
            onClick={() => router.push("/parent")}
            className="p-3 rounded-xl font-bold bg-green-700 hover:bg-green-800 text-white transition shadow"
          >
            <span className="text-2xl">👨‍👩‍👧</span>
            <br />
            Parent
          </button>

        </div>

        {/* LOGIN TITLE */}

        <div className="text-center mb-5">

          <h2 className="text-2xl font-bold text-green-950">
            {loginType === "admin"
              ? "👑 Admin Login"
              : "👨‍🏫 Teacher Login"}
          </h2>

        </div>

        {/* USERNAME */}

        <label className="block text-green-950 font-semibold mb-2">
          Username
        </label>

        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-green-200 bg-white rounded-xl p-3 mb-4 text-gray-900 outline-none focus:ring-2 focus:ring-green-700"
        />

        {/* PASSWORD */}

        <label className="block text-green-950 font-semibold mb-2">
          Password
        </label>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              login();
            }
          }}
          className="w-full border border-green-200 bg-white rounded-xl p-3 mb-5 text-gray-900 outline-none focus:ring-2 focus:ring-green-700"
        />

        {/* LOGIN BUTTON */}

        <button
          type="button"
          onClick={login}
          disabled={loading}
          className="w-full bg-green-800 hover:bg-green-900 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold shadow-lg transition"
        >
          {loading ? "Please wait..." : "🔐 Login"}
        </button>

        {/* FOOTER */}

        <p className="text-center text-sm text-gray-500 mt-6">
          MUNAFASA 2026 • THE GLOBAL PUBLIC SHOOL 
        </p>

      </div>

    </div>
  );
}