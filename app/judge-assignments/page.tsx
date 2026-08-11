"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../../lib/supabase";

export default function JudgeAssignmentsPage() {
  const [judges, setJudges] = useState<any[]>([]);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [selectedJudge, setSelectedJudge] = useState("");
  const [selectedProgrammes, setSelectedProgrammes] = useState<number[]>([]);

  async function loadData() {
    const { data: judgeData } = await supabase
      .from("judges")
      .select("*")
      .order("judge_name");

    const { data: programmeData } = await supabase
      .from("programmes")
      .select("*")
      .order("programme_name");

    setJudges(judgeData || []);
    setProgrammes(programmeData || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadAssignments(judgeId: string) {
    setSelectedJudge(judgeId);

    const { data } = await supabase
      .from("judge_programmes")
      .select("programme_id")
      .eq("judge_id", judgeId);

    setSelectedProgrammes(
      data ? data.map((p: any) => Number(p.programme_id)) : []
    );
  }

  async function saveAssignments() {
    if (!selectedJudge) {
      alert("Please select a judge.");
      return;
    }

    const { error: deleteError } = await supabase
      .from("judge_programmes")
      .delete()
      .eq("judge_id", selectedJudge);

    if (deleteError) {
      alert(deleteError.message);
      return;
    }

    const rows = programmes
      .filter((p) => selectedProgrammes.includes(p.id))
      .map((p) => ({
        judge_id: Number(selectedJudge),
        programme_id: p.id,
        programme_code: p.programme_code,
        programme_name: p.programme_name,
        venue: p.venue_type,
      }));

    const { error } = await supabase
      .from("judge_programmes")
      .insert(rows);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Assignments saved successfully!");
  }
    return (
    <>
      <Navbar />

      <main className="min-h-screen bg-green-950 text-white p-8">
        <div className="max-w-7xl mx-auto">

          <h1 className="text-5xl font-bold text-yellow-400 mb-8">
            🎭 Judge Programme Assignment
          </h1>

          <div className="bg-green-900 rounded-xl p-6 mb-8">

            <label className="block font-bold mb-3">
              Select Judge
            </label>

            <select
              value={selectedJudge}
              onChange={(e) => loadAssignments(e.target.value)}
              className="w-full p-3 rounded text-black mb-6"
            >
              <option value="">-- Select Judge --</option>

              {judges.map((judge) => (
                <option key={judge.id} value={judge.id}>
                  {judge.judge_name}
                </option>
              ))}
            </select>

            <h2 className="text-2xl font-bold mb-4">
              Available Programmes
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">

              {programmes.map((programme) => (

                <label
                  key={programme.id}
                  className="bg-green-800 rounded-lg p-4 flex items-start gap-3 cursor-pointer hover:bg-green-700"
                >

                  <input
                    type="checkbox"
                    checked={selectedProgrammes.includes(programme.id)}
                    onChange={(e) => {

                      if (e.target.checked) {
                        setSelectedProgrammes([
                          ...selectedProgrammes,
                          programme.id,
                        ]);
                      } else {
                        setSelectedProgrammes(
                          selectedProgrammes.filter(
                            (id) => id !== programme.id
                          )
                        );
                      }

                    }}
                  />

                  <div>
                    <div className="font-bold">
                      {programme.programme_name}
                    </div>

                    <div className="text-yellow-300 text-sm">
                      {programme.programme_code}
                    </div>

                    <div className="text-sm">
                      {programme.category} | {programme.venue_type}
                    </div>
                  </div>

                </label>

              ))}

            </div>

            <div className="mt-8 flex justify-between items-center">

              <p className="text-yellow-300 font-bold">
                Selected Programmes: {selectedProgrammes.length}
              </p>

              <button
                onClick={saveAssignments}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-bold"
              >
                💾 Save Assignments
              </button>

            </div>

          </div>

        </div>
      </main>
    </>
  );
}