"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import BackButton from "../components/layout/BackButton";
import { supabase } from "@/lib/supabase";

type Judge = {
  id: number;
  judge_name: string;
};

type Programme = {
  id: number;
  programme_name: string;
};

type Stage = {
  id: number;
  stage_name: string;
};

type Assignment = {
  id: number;
  judge_id: number;
  programme_id: number;
  stage_id: number;
};

export default function JudgeAssignmentPage() {

  const [judges, setJudges] = useState<Judge[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [judgeId, setJudgeId] = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const [stageId, setStageId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    const { data: judgeData } = await supabase
      .from("judges")
      .select("id, judge_name")
      .order("judge_name");

    const { data: programmeData } = await supabase
      .from("programmes")
      .select("id, programme_name")
      .order("programme_name");

    const { data: stageData } = await supabase
      .from("stages")
      .select("id, stage_name")
      .order("stage_name");

    const { data: assignmentData } = await supabase
      .from("judge_assignments")
      .select("*")
      .order("id", { ascending: false });

    setJudges(judgeData || []);
    setProgrammes(programmeData || []);
    setStages(stageData || []);
    setAssignments(assignmentData || []);

  }
  async function saveAssignment() {

  if (!judgeId || !programmeId || !stageId) {
    alert("Please select Judge, Programme and Stage.");
    return;
  }

  // Prevent duplicate assignment
  const { data: existing } = await supabase
    .from("judge_assignments")
    .select("id")
    .eq("judge_id", judgeId)
    .eq("programme_id", programmeId);

  if (existing && existing.length > 0) {
    alert("This judge is already assigned to this programme.");
    return;
  }

  const { error } = await supabase
    .from("judge_assignments")
    .insert({
      judge_id: Number(judgeId),
      programme_id: Number(programmeId),
      stage_id: Number(stageId),
    });

  if (error) {
    alert(error.message);
    return;
  }

  alert("✅ Judge Assigned");

  setJudgeId("");
  setProgrammeId("");
  setStageId("");

  loadData();
}

async function deleteAssignment(id: number) {

  if (!confirm("Delete this assignment?")) return;

  await supabase
    .from("judge_assignments")
    .delete()
    .eq("id", id);

  loadData();
}
return (
  <DashboardLayout>

    <BackButton />

    <div className="flex justify-between items-center mb-8">

      <div>
        <h1 className="text-4xl font-bold">
          👨‍⚖️ Judge Assignment
        </h1>

        <p className="text-gray-500">
          Total Assignments : {assignments.length}
        </p>
      </div>

    </div>

    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

      <div className="grid md:grid-cols-3 gap-6">

        <select
          className="border rounded-lg p-3"
          value={judgeId}
          onChange={(e) => setJudgeId(e.target.value)}
        >
          <option value="">Select Judge</option>

          {judges.map((judge) => (
            <option key={judge.id} value={judge.id}>
              {judge.judge_name}
            </option>
          ))}

        </select>

        <select
          className="border rounded-lg p-3"
          value={programmeId}
          onChange={(e) => setProgrammeId(e.target.value)}
        >
          <option value="">Select Programme</option>

          {programmes.map((programme) => (
            <option key={programme.id} value={programme.id}>
              {programme.programme_name}
            </option>
          ))}

        </select>

        <select
          className="border rounded-lg p-3"
          value={stageId}
          onChange={(e) => setStageId(e.target.value)}
        >
          <option value="">Select Stage</option>

          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.stage_name}
            </option>
          ))}

        </select>

      </div>

      <button
        onClick={saveAssignment}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
      >
        👨‍⚖️ Assign Judge
      </button>

    </div>
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto mt-8">

      <table className="w-full">

        <thead className="bg-blue-900 text-white">

          <tr>
            <th className="p-4 text-left">Judge</th>
            <th className="p-4 text-left">Programme</th>
            <th className="p-4 text-left">Stage</th>
            <th className="p-4 text-center">Actions</th>
          </tr>

        </thead>

        <tbody>

          {assignments.map((assignment) => {

            const judge = judges.find(
              (j) => j.id === assignment.judge_id
            );

            const programme = programmes.find(
              (p) => p.id === assignment.programme_id
            );

            const stage = stages.find(
              (s) => s.id === assignment.stage_id
            );

            return (

              <tr
                key={assignment.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">
                  {judge?.judge_name || "-"}
                </td>

                <td className="p-4">
                  {programme?.programme_name || "-"}
                </td>

                <td className="p-4">
                  {stage?.stage_name || "-"}
                </td>

                <td className="p-4 text-center">

                  <button
                    onClick={() => deleteAssignment(assignment.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑 Delete
                  </button>

                </td>

              </tr>

            );

          })}

        </tbody>

      </table>

    </div>

  </DashboardLayout>
);
}