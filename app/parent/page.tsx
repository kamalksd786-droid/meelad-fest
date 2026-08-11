"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ParentDashboard() {
  const router = useRouter();

  const [admissionNo, setAdmissionNo] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [loading, setLoading] = useState(false);

  async function findStudent() {
    if (!admissionNo.trim()) {
      alert("Please enter admission number.");
      return;
    }

    if (!studentClass.trim()) {
      alert("Please enter class.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("admission_no", admissionNo.trim())
      .eq("class", studentClass.trim())
      .single();

    setLoading(false);

    if (error || !data) {
      alert("Student not found. Please check Admission Number and Class.");
      return;
    }

    // Store the selected student temporarily
    localStorage.setItem("parentStudent", JSON.stringify(data));

    // Go to programme selection
    router.push("/parent/programmes");
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-purple-800 text-white px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">
            MUNAFASA 2026
          </h1>

          <p className="text-purple-200">
            Parent Portal
          </p>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto p-6">

        <h2 className="text-3xl font-bold mb-2">
          👨‍👩‍👧 Parent Portal
        </h2>

        <p className="text-gray-600 mb-8">
          Enter your child's Admission Number and Class to register
          for MUNAFASA programmes.
        </p>

        {/* STUDENT SEARCH */}
        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h3 className="text-2xl font-bold mb-6">
            🔍 Find Your Child
          </h3>

          {/* ADMISSION NUMBER */}
          <div className="mb-5">

            <label className="block font-semibold mb-2">
              Admission Number
            </label>

            <input
              type="text"
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value)}
              placeholder="Enter Admission Number"
              className="w-full border rounded-lg p-4"
            />

          </div>

          {/* CLASS */}
          <div className="mb-6">

            <label className="block font-semibold mb-2">
              Class
            </label>

            <input
              type="text"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              placeholder="Example: 6A"
              className="w-full border rounded-lg p-4"
            />

          </div>

          <button
            type="button"
            onClick={findStudent}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-bold text-lg"
          >
            {loading ? "Searching..." : "🔍 Find Student"}
          </button>

        </div>

        {/* RESULTS */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-blue-600 text-white rounded-2xl p-6">
            <div className="text-4xl mb-3">
              🎭
            </div>

            <h3 className="text-xl font-bold">
              Programme Registration
            </h3>

            <p className="mt-2 text-blue-100">
              Find your child and select MUNAFASA programmes.
            </p>
          </div>

          <div className="bg-gray-400 text-white rounded-2xl p-6">
            <div className="text-4xl mb-3">
              🏆
            </div>

            <h3 className="text-xl font-bold">
              Results
            </h3>

            <p className="mt-2 text-gray-100">
              Published results will be available here.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}