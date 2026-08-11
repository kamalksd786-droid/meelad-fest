"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function JudgeResultPage() {
const router = useRouter();
  const [participants, setParticipants] = useState<any[]>([]);

  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [third, setThird] = useState("");

  useEffect(() => {

    loadParticipants();

  }, []);

  async function loadParticipants() {

    const params = new URLSearchParams(window.location.search);

    const programmeId = params.get("programme");

    const { data } = await supabase
      .from("registrations")
      .select("*")
      .eq("programme_id", programmeId)
      .order("student_name");

    setParticipants(data || []);

  }
  async function saveResult() {

  if (!first || !second || !third) {
    alert("Please select 1st, 2nd and 3rd place.");
    return;
  }

  if (first === second || first === third || second === third) {
    alert("A participant cannot occupy more than one position.");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const programmeId = params.get("programme");

  const judge = JSON.parse(localStorage.getItem("judge") || "{}");

  const results = [
    {
      judge_id: judge.id,
      programme_id: programmeId,
      admission_no: first,
      position: "First",
      points: 10,
    },
    {
      judge_id: judge.id,
      programme_id: programmeId,
      admission_no: second,
      position: "Second",
      points: 7,
    },
    {
      judge_id: judge.id,
      programme_id: programmeId,
      admission_no: third,
      position: "Third",
      points: 5,
    },
  ];

  const { error } = await supabase
    .from("results")
    .insert(results);

  if (error) {
    alert(error.message);
    return;
  }

  await supabase
  .from("judge_assignments")
  .update({
    status: "Completed",
  })
  .eq("id", params.get("assignment"));

alert("✅ Results Submitted");

router.push("/judge-dashboard");
}
return (
  <div className="min-h-screen bg-slate-100 p-8">

    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">

      <h1 className="text-4xl font-bold mb-8">
        🏆 Judge Result Entry
      </h1>

      <div className="space-y-6">

        <div>
          <label className="font-bold">🥇 First Place</label>

          <select
            className="w-full border rounded-lg p-3 mt-2"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
          >
            <option value="">Select Participant</option>

            {participants.map((p) => (
              <option
                key={p.id}
                value={p.admission_no}
              >
                {p.admission_no} - {p.student_name} ({p.team})
              </option>
            ))}

          </select>
        </div>

        <div>
          <label className="font-bold">🥈 Second Place</label>

          <select
            className="w-full border rounded-lg p-3 mt-2"
            value={second}
            onChange={(e) => setSecond(e.target.value)}
          >
            <option value="">Select Participant</option>

            {participants.map((p) => (
              <option
                key={p.id}
                value={p.admission_no}
              >
                {p.admission_no} - {p.student_name} ({p.team})
              </option>
            ))}

          </select>
        </div>

        <div>
          <label className="font-bold">🥉 Third Place</label>

          <select
            className="w-full border rounded-lg p-3 mt-2"
            value={third}
            onChange={(e) => setThird(e.target.value)}
          >
            <option value="">Select Participant</option>

            {participants.map((p) => (
              <option
                key={p.id}
                value={p.admission_no}
              >
                {p.admission_no} - {p.student_name} ({p.team})
              </option>
            ))}

          </select>
        </div>

      </div>

      <button
        onClick={saveResult}
        className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg text-xl font-bold"
      >
        ✅ Submit Result
      </button>

    </div>

  </div>
);
}