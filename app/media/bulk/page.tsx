"use client";

import { useState } from "react";

export default function BulkGenerator() {
  const [programme, setProgramme] = useState("");
  const [category, setCategory] = useState("");
  const [team, setTeam] = useState("");

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-4xl font-bold mb-8">
        📦 Bulk Poster Generator
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl">

        <label className="font-semibold">
          Programme
        </label>

        <input
          className="w-full border rounded-lg p-3 mt-2 mb-6"
          value={programme}
          onChange={(e)=>setProgramme(e.target.value)}
          placeholder="Arabic Speech"
        />

        <label className="font-semibold">
          Category
        </label>

        <input
          className="w-full border rounded-lg p-3 mt-2 mb-6"
          value={category}
          onChange={(e)=>setCategory(e.target.value)}
          placeholder="Junior"
        />

        <label className="font-semibold">
          Team
        </label>

        <input
          className="w-full border rounded-lg p-3 mt-2 mb-8"
          value={team}
          onChange={(e)=>setTeam(e.target.value)}
          placeholder="FURATH"
        />

        <button
          className="w-full bg-green-700 text-white py-4 rounded-xl text-xl font-bold"
        >
          🚀 Generate Posters
        </button>

      </div>

    </main>
  );
}