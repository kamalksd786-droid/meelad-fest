"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RegistrationHistory from "../register/RegistrationHistory";

export default function TeacherRegistrationsPage() {
  const [teacherId, setTeacherId] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [registrations, setRegistrations] = useState<any[]>([]);

  useEffect(() => {
    const id = localStorage.getItem("teacherId");
    const name = localStorage.getItem("teacherName");

    if (!id) {
      window.location.href = "/teacher-login";
      return;
    }

    setTeacherId(id);
    setTeacherName(name || "");

    loadRegistrations(id);
  }, []);

  async function loadRegistrations(id: string) {
    if (!id) return;

    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("teacher_id", id)
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setRegistrations(data || []);
  }

  function logout() {
    localStorage.removeItem("teacherId");
    localStorage.removeItem("teacherName");

    window.location.href = "/teacher-login";
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="bg-purple-800 text-white px-6 py-5 flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold">
            MUNAFASA 2026
          </h1>

          <p className="text-purple-200">
            Teacher Registrations
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg font-semibold"
        >
          Logout
        </button>

      </div>

      <div className="max-w-7xl mx-auto p-6">

        <div className="flex justify-between items-center mb-6">

          <div>
            <h2 className="text-3xl font-bold">
              📋 View Registrations
            </h2>

            <p className="text-gray-600 mt-1">
              {teacherName
                ? `Teacher: ${teacherName}`
                : "Your registered programmes"}
            </p>
          </div>

          <button
            onClick={() => loadRegistrations(teacherId)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold"
          >
            🔄 Refresh
          </button>

        </div>

        <RegistrationHistory
          teacherId={teacherId}
          registrations={registrations}
          refresh={() => loadRegistrations(teacherId)}
        />

      </div>

    </div>
  );
}