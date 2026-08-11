"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

type Result = {
  programme_name: string;
  student_name: string;
  team: string;
  category: string;
  total_marks: number;
  position: number;
};

export default function ProgrammeResultsReport() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    const { data, error } = await supabase
      .from("published_results")
      .select("*")
      .order("programme_name")
      .order("position");

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setResults(data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <div>

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          🎭 Programme Results Report
        </h1>

        <button
          onClick={() => window.print()}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
        >
          🖨 Print
        </button>

      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-green-700 text-white">

            <tr>
              <th className="p-3">Programme</th>
              <th>Student</th>
              <th>Team</th>
              <th>Category</th>
              <th>Marks</th>
              <th>Position</th>
            </tr>

          </thead>

          <tbody>

            {results.map((row, index) => (

              <tr
                key={index}
                className="border-b text-center hover:bg-gray-50"
              >

                <td className="p-3">
                  {row.programme_name}
                </td>

                <td>{row.student_name}</td>

                <td>{row.team}</td>

                <td>{row.category}</td>

                <td>{row.total_marks}</td>

                <td>

                  {row.position === 1 && "🥇"}

                  {row.position === 2 && "🥈"}

                  {row.position === 3 && "🥉"}

                  {row.position > 3 && row.position}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}