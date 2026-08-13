 "use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import Navbar from "../components/Navbar";
import { supabase } from "../../lib/supabase";

export default function ImportStudentsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setLoading(true);
    setMessage("");

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

const students = rows.map((row) => ({
  admission_no: String(
    row["Admission Number"] || row.admission_no || ""
  ).trim(),

  student_name: String(
    row["Student Name"] || row.student_name || ""
  ).trim(),

  class: String(
    row["Class"] || row.class || ""
  ).trim(),

  division: String(
    row["Division"] || row.division || ""
  ).trim(),

  gender: String(
    row["Gender"] || row.gender || ""
  ).trim(),

  team: String(
    row["Team"] || row.team || ""
  ).trim(),

  chest_no: String(
    row["Chest No."] || row["Chest No"] || row.chest_no || ""
  ).trim(),

  category: String(
    row["Category"] || row.category || ""
  ).trim(),
}));

alert(JSON.stringify(students, null, 2));

const { error } = await supabase
  .from("students")
  .insert(students);
    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ Students imported successfully!");
    }

    setLoading(false);
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-green-950 text-white p-10">

        <div className="max-w-2xl mx-auto bg-green-900 rounded-xl p-8">

          <h1 className="text-4xl font-bold mb-8">
            📥 Import Students
          </h1>

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="mb-6"
          />

          <button
            disabled={loading}
            className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold"
          >
            {loading ? "Importing..." : "Import Students"}
          </button>

          {message && (
            <p className="mt-6 text-xl">{message}</p>
          )}

        </div>

      </main>
    </>
  );
}