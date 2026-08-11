"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../../lib/supabase";

export default function ReportsPage() {
  const [programmeCount, setProgrammeCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [scoreCount, setScoreCount] = useState(0);

  async function loadCounts() {
    const [
      { count: programmes },
      { count: students },
      { count: registrations },
      { count: scores },
    ] = await Promise.all([
      supabase.from("programmes").select("*", { count: "exact", head: true }),
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase.from("registrations").select("*", { count: "exact", head: true }),
      supabase.from("scores").select("*", { count: "exact", head: true }),
    ]);

    setProgrammeCount(programmes || 0);
    setStudentCount(students || 0);
    setRegistrationCount(registrations || 0);
    setScoreCount(scores || 0);
  }

  useEffect(() => {
    loadCounts();
  }, []);
    return (
    <>
      <Navbar />

      <main className="min-h-screen bg-green-950 text-white p-8">
        <div className="max-w-7xl mx-auto">

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-5xl font-bold text-yellow-400">
                📊 Reports Center
              </h1>
              <p className="text-gray-300 mt-2">
                MUNAFASA 2026 Reports & Statistics
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-3 rounded-lg font-bold"
            >
              Print Reports
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            <div className="bg-blue-700 rounded-xl p-6">
              <h2 className="text-xl font-bold">👨‍🎓 Students</h2>
              <p className="text-4xl font-bold mt-4">
                {studentCount}
              </p>
            </div>

            <div className="bg-purple-700 rounded-xl p-6">
              <h2 className="text-xl font-bold">🎭 Programmes</h2>
              <p className="text-4xl font-bold mt-4">
                {programmeCount}
              </p>
            </div>

            <div className="bg-green-700 rounded-xl p-6">
              <h2 className="text-xl font-bold">📝 Registrations</h2>
              <p className="text-4xl font-bold mt-4">
                {registrationCount}
              </p>
            </div>

            <div className="bg-orange-600 rounded-xl p-6">
              <h2 className="text-xl font-bold">🏅 Scores Entered</h2>
              <p className="text-4xl font-bold mt-4">
                {scoreCount}
              </p>
            </div>

          </div>

          <div className="bg-green-900 rounded-xl p-8">

            <h2 className="text-3xl font-bold mb-6">
              📄 Available Reports
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

              <a
                href="/results"
                className="bg-blue-600 hover:bg-blue-700 rounded-lg p-5 text-center font-bold"
              >
                📄 Programme Results
              </a>

              <a
                href="/leaderboard"
                className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg p-5 text-center font-bold"
              >
                🏆 Team Leaderboard
              </a>

              <a
                href="/championship"
                className="bg-red-600 hover:bg-red-700 rounded-lg p-5 text-center font-bold"
              >
                👑 Championship
              </a>

              <a
                href="/registrations"
                className="bg-green-600 hover:bg-green-700 rounded-lg p-5 text-center font-bold"
              >
                📝 Registration Report
              </a>

              <a
                href="/students"
                className="bg-indigo-600 hover:bg-indigo-700 rounded-lg p-5 text-center font-bold"
              >
                👨‍🎓 Student Report
              </a>

              <a
                href="/programmes"
                className="bg-pink-600 hover:bg-pink-700 rounded-lg p-5 text-center font-bold"
              >
                🎭 Programme Report
              </a>

              <a
                href="/score-entry"
                className="bg-orange-600 hover:bg-orange-700 rounded-lg p-5 text-center font-bold"
              >
                🏅 Score Report
              </a>

              <a
                href="/certificates"
                className="bg-cyan-600 hover:bg-cyan-700 rounded-lg p-5 text-center font-bold"
              >
                📜 Certificates
              </a>

            </div>

          </div>
                    <div className="grid md:grid-cols-3 gap-6 mt-8">

            <button
              onClick={() => window.print()}
              className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl p-6 font-bold text-xl"
            >
              🖨️ Print All Reports
            </button>

            <button
              onClick={() => alert("Excel Export Module - Coming Next")}
              className="bg-green-600 hover:bg-green-700 rounded-xl p-6 font-bold text-xl"
            >
              📥 Export Excel
            </button>

            <button
              onClick={() => alert("PDF Export Module - Coming Next")}
              className="bg-red-600 hover:bg-red-700 rounded-xl p-6 font-bold text-xl"
            >
              📄 Export PDF
            </button>

          </div>

          <div className="mt-10 bg-green-900 rounded-xl p-6 text-center">

            <h2 className="text-2xl font-bold text-yellow-400">
              MUNAFASA 2026 Reporting Center
            </h2>

            <p className="text-gray-300 mt-2">
              Generate reports, print summaries and export festival data.
            </p>

          </div>

        </div>
      </main>
    </>
  );
}