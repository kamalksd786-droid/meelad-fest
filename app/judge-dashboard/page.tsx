"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";


type Assignment = {
  id: number;
  programme_id: number;
  stage_id: number;
};

type Programme = {
  id: number;
  programme_name: string;
};

type Stage = {
  id: number;
  stage_name: string;
};

export default function JudgeDashboardPage() {
const router = useRouter();
  const [judge, setJudge] = useState<any>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {

    const loggedJudge = JSON.parse(
      localStorage.getItem("judge") || "null"
    );

    if (!loggedJudge) return;

    setJudge(loggedJudge);

    loadData(loggedJudge.id);

  }, []);

  async function loadData(judgeId: number) {

    const { data: assignmentData } = await supabase
      .from("judge_assignments")
      .select("*")
      .eq("judge_id", judgeId);

    const { data: programmeData } = await supabase
      .from("programmes")
      .select("id, programme_name");

    const { data: stageData } = await supabase
      .from("stages")
      .select("id, stage_name");

    setAssignments(assignmentData || []);
    setProgrammes(programmeData || []);
    setStages(stageData || []);

  }
  return (
  <div className="min-h-screen bg-slate-100 p-8">

    <div className="max-w-6xl mx-auto">

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

        <h1 className="text-4xl font-bold">
          👨‍⚖️ Judge Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Welcome {judge?.judge_name}
        </p>

      </div>

      <div className="grid gap-6">

        {assignments.map((assignment) => {

          const programme = programmes.find(
            (p) => p.id === assignment.programme_id
          );

          const stage = stages.find(
            (s) => s.id === assignment.stage_id
          );

          return (

            <div
              key={assignment.id}
              className="bg-white rounded-xl shadow-lg p-6"
            >

              <h2 className="text-2xl font-bold">
                {programme?.programme_name}
              </h2>

              <p className="text-gray-500 mt-2">
                🎤 {stage?.stage_name}
              </p>

              <button
  onClick={() =>
    router.push(
      `/judge-result?programme=${assignment.programme_id}&assignment=${assignment.id}`
    )
  }
  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
>
  ▶ Start Judging
</button>
            </div>

          );

        })}

      </div>

    </div>

  </div>
);
}