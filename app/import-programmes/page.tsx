"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import Navbar from "../components/Navbar";
import { supabase } from "../../lib/supabase";

export default function ImportProgrammesPage() {
  const [message, setMessage] = useState("");

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet);

const programmes = rows.map((row: any) => ({
  programme_code: row["programme_code"],
  programme_name: row["programme_name"],
  participant_type: row["participant_type"],
  max_participants: row["No. of Participants"],
  gender: row["gender"],
  event_type: row["event_type (Musabaqa / Munafasa / Sahodaya)"],
  venue_type: row["venue_type"],
  category: row["category"],
  remarks: row["remarks"],
}));

const { error } = await supabase
  .from("programmes")
  .insert(programmes);

if (error) {
  console.error(error);
  setMessage("❌ Import failed: " + error.message);
} else {
  setMessage("✅ Programmes imported successfully!");
}
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-green-950 text-white p-10">
        <div className="max-w-2xl mx-auto bg-green-900 rounded-xl p-8">

          <h1 className="text-4xl font-bold mb-8">
            📥 Import Programmes
          </h1>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="mb-6"
          />

          <button
            className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold"
          >
            Import Programmes
          </button>

          {message && (
            <p className="mt-6">{message}</p>
          )}

        </div>
      </main>
    </>
  );
}