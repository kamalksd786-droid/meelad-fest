"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";
import { supabase } from "../../../lib/supabase";

export default function AddStudentPage() {
  const [admissionNo, setAdmissionNo] = useState("");
  const [studentName, setStudentName] = useState("");
  const [category, setCategory] = useState("Kiddies");
  const [team, setTeam] = useState("DIJLA");
  const [loading, setLoading] = useState(false);

  async function saveStudent(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.from("students").insert([
      {
        admission_no: admissionNo,
        student_name: studentName,
        category: category,
        team: team,
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    alert("Student saved successfully!");

    setAdmissionNo("");
    setStudentName("");
    setCategory("Kiddies");
    setTeam("DIJLA");
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-green-950 text-white p-10">
        <div className="max-w-3xl mx-auto bg-green-900 rounded-xl p-8">

          <h1 className="text-4xl font-bold mb-8">
            âž• Add Student
          </h1>

          <form onSubmit={saveStudent} className="space-y-5">

            <input
              type="text"
              placeholder="Admission Number"
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value)}
              className="w-full p-3 rounded-lg text-black"
              required
            />

            <input
              type="text"
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full p-3 rounded-lg text-black"
              required
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-lg text-black"
            >
              <option>Kiddies</option>
              <option>Sub Junior</option>
              <option>Junior</option>
              <option>Senior</option>

            </select>

            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full p-3 rounded-lg text-black"
            >
              <option>DIJLA</option>
              <option>FURATH</option>
              <option>NILE</option>
              <option>SAIHOON</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold"
            >
              {loading ? "Saving..." : "Save Student"}
            </button>

          </form>

        </div>
      </main>
    </>
  );
}
