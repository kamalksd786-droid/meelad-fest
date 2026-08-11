"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import BackButton from "@/app/components/layout/BackButton";
import { supabase } from "@/lib/supabase";

type Stage = {
  id: number;
  stage_name: string;
  stage_code: string;
  status: string;
};

export default function StagesPage() {

  const [stages, setStages] = useState<Stage[]>([]);

  const [stageName, setStageName] = useState("");
  const [stageCode, setStageCode] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadStages();
  }, []);

  async function loadStages() {

    const { data } = await supabase
      .from("stages")
      .select("*")
      .order("stage_name");

    setStages(data || []);

  }
  async function saveStage() {

  if (!stageName || !stageCode) {
    alert("Please enter Stage Name and Stage Code.");
    return;
  }

  // Check duplicate stage code
  const { data: existing } = await supabase
    .from("stages")
    .select("id")
    .eq("stage_code", stageCode);

  if (existing && existing.length > 0) {
    alert("Stage Code already exists.");
    return;
  }

  const { error } = await supabase
    .from("stages")
    .insert({
      stage_name: stageName,
      stage_code: stageCode,
      status: "Active",
    });

  if (error) {
    alert(error.message);
    return;
  }

  alert("✅ Stage Added");

  setStageName("");
  setStageCode("");

  loadStages();
}

async function deleteStage(id: number) {

  if (!confirm("Delete this stage?")) return;

  await supabase
    .from("stages")
    .delete()
    .eq("id", id);

  loadStages();
}
return (
  <DashboardLayout>

    <BackButton />

    <div className="flex justify-between items-center mb-8">

      <div>

       <h1 className="text-4xl font-bold text-red-600">
  THIS IS THE NEW STAGE PAGE
</h1>

        <p className="text-gray-500">
          Total Stages : {stages.length}
        </p>

      </div>

    </div>

    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

      <div className="grid md:grid-cols-2 gap-6">

        <input
          placeholder="Stage Name"
          className="border rounded-lg p-3"
          value={stageName}
          onChange={(e) => setStageName(e.target.value)}
        />

        <input
          placeholder="Stage Code"
          className="border rounded-lg p-3"
          value={stageCode}
          onChange={(e) => setStageCode(e.target.value)}
        />

      </div>

      <button
        onClick={saveStage}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
      >
        ➕ Add Stage
      </button>

    </div>

    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">

      <input
        type="text"
        placeholder="🔍 Search Stage..."
        className="w-full border rounded-lg p-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

    </div>
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

      <table className="w-full">

        <thead className="bg-blue-900 text-white">

          <tr>
            <th className="p-4 text-left">Stage Name</th>
            <th className="p-4 text-left">Stage Code</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-center">Actions</th>
          </tr>

        </thead>

        <tbody>

          {stages
            .filter((stage) =>
              (
                stage.stage_name +
                stage.stage_code
              )
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((stage) => (

              <tr
                key={stage.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">
                  {stage.stage_name}
                </td>

                <td className="p-4">
                  {stage.stage_code}
                </td>

                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {stage.status}
                  </span>
                </td>

                <td className="p-4 text-center">

                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => deleteStage(stage.id)}
                  >
                    🗑 Delete
                  </button>

                </td>

              </tr>

            ))}

        </tbody>

      </table>

    </div>

  </DashboardLayout>
);
}