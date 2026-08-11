"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ParentResultsPage() {
  const [admissionNo, setAdmissionNo] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function searchResults() {
    if (!admissionNo.trim()) {
      alert("Please enter Admission Number");
      return;
    }

    setLoading(true);
    setResults([]);
    setStudent(null);

    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("admission_no", admissionNo.trim())
      .maybeSingle();

    if (studentError) {
      alert(studentError.message);
      setLoading(false);
      return;
    }

    if (!studentData) {
      alert("Student not found");
      setLoading(false);
      return;
    }

    setStudent(studentData);

    // IMPORTANT:
    // Parent can see ONLY published results.
    const { data: resultData, error: resultError } = await supabase
      .from("results")
      .select("*")
      .eq("admission_no", studentData.admission_no)
      .eq("published", true)
      .order("points", { ascending: false });

    if (resultError) {
      alert(resultError.message);
      setLoading(false);
      return;
    }

    setResults(resultData || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="bg-purple-800 text-white px-6 py-6">
        <h1 className="text-3xl font-bold">
          MUNAFASA 2026
        </h1>

        <p className="text-purple-200">
          Parent Results
        </p>
      </header>

      <main className="max-w-6xl mx-auto p-6">

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <h2 className="text-3xl font-bold mb-5">
            🏆 View Results
          </h2>

          <div className="flex gap-3">

            <input
              type="text"
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value)}
              placeholder="Enter Admission Number"
              className="border rounded-lg p-3 flex-1"
            />

            <button
              onClick={searchResults}
              disabled={loading}
              className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-lg font-bold"
            >
              {loading ? "Searching..." : "Search"}
            </button>

          </div>

        </div>

        {student && (

          <div className="bg-white rounded-xl shadow p-6 mb-6">

            <h2 className="text-2xl font-bold mb-4">
              Student Details
            </h2>

            <p>
              <b>Admission No:</b> {student.admission_no}
            </p>

            <p>
              <b>Name:</b> {student.student_name}
            </p>

            <p>
              <b>Class:</b> {student.class || "-"}
            </p>

            <p>
              <b>Team:</b> {student.team || "-"}
            </p>

          </div>

        )}

        {student && results.length === 0 && (

          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6">
            <h3 className="text-xl font-bold text-yellow-800">
              No Published Results
            </h3>

            <p className="text-yellow-700 mt-2">
              Results have not been published for this student yet.
            </p>
          </div>

        )}

        {results.length > 0 && (

          <div className="bg-white rounded-xl shadow overflow-hidden">

            <div className="p-6">

              <h2 className="text-2xl font-bold">
                Published Results
              </h2>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-blue-900 text-white">

                  <tr>

                    <th className="p-4 text-left">
                      Programme
                    </th>

                    <th className="p-4 text-left">
                      Position
                    </th>

                    <th className="p-4 text-left">
                      Points
                    </th>

                    <th className="p-4 text-left">
                      Remarks
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {results.map((result) => (

                    <tr
                      key={result.id}
                      className="border-b"
                    >

                      <td className="p-4 font-semibold">
                        {result.programme_name}
                      </td>

                      <td className="p-4 font-bold">
                        {result.position}
                      </td>

                      <td className="p-4">
                        {result.points}
                      </td>

                      <td className="p-4">
                        {result.remarks || "-"}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}