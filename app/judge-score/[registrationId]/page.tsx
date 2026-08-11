// Judge Score Entry page template
// NOTE: This is a starter file. Paste into:
// app/judge-score/[registrationId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function JudgeScorePage() {
  const { registrationId } = useParams<{ registrationId: string }>();
  const router = useRouter();

  const [registration, setRegistration] = useState<any>(null);
  const [judge, setJudge] = useState<any>(null);
  const [marks, setMarks] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const stored = localStorage.getItem("judge");
    if (!stored) {
      router.push("/judge-login");
      return;
    }

    const j = JSON.parse(stored);
    setJudge(j);

    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", Number(registrationId))
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setRegistration(data);

    const { data: existing } = await supabase
      .from("scores")
      .select("*")
      .eq("registration_id", data.id)
      .eq("judge_name", j.judge_name)
      .maybeSingle();

    if (existing) {
      setMarks(String(existing.marks ?? ""));
      setRemarks(existing.remarks ?? "");
    }

    setLoading(false);
  }

  async function saveMarks() {
    if (!registration) return;

    if (!marks) {
      alert("Please enter marks.");
      return;
    }

    setSaving(true);

    const payload = {
      registration_id: registration.id,
      programme_id: registration.programme_id,
      programme_code: registration.programme_code,
      programme_name: registration.programme_name,
      student_id: registration.student_id,
      admission_no: registration.admission_no,
      student_name: registration.student_name,
      class: registration.class,
      team: registration.team,
      category: registration.category,
      judge_name: judge.judge_name,
      marks: Number(marks),
      remarks,
      event_type: registration.event_type,
      point_rule: registration.point_rule,
    };

    const { data: existing } = await supabase
      .from("scores")
      .select("id")
      .eq("registration_id", registration.id)
      .eq("judge_name", judge.judge_name)
      .maybeSingle();

    let error;

    if (existing) {
      ({ error } = await supabase.from("scores").update(payload).eq("id", existing.id));
    } else {
      ({ error } = await supabase.from("scores").insert(payload));
    }

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Marks saved successfully.");
    router.back();
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl">Loading...</div>;
  if (!registration) return <div className="min-h-screen flex items-center justify-center">Registration not found.</div>;

  return (
    <main className="min-h-screen bg-green-950 text-white p-8">
      <div className="max-w-4xl mx-auto bg-green-900 rounded-xl p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-yellow-400">Judge Score Entry</h1>
          <button onClick={() => router.back()} className="bg-gray-700 px-4 py-2 rounded">Back</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><strong>Name:</strong> {registration.student_name}</div>
          <div><strong>Admission:</strong> {registration.admission_no}</div>
          <div><strong>Class:</strong> {registration.class}</div>
          <div><strong>Team:</strong> {registration.team}</div>
          <div><strong>Programme:</strong> {registration.programme_name}</div>
          <div><strong>Category:</strong> {registration.category}</div>
        </div>

        <div>
          <label>Marks</label>
          <input
            className="w-full text-black rounded p-2"
            type="number"
            value={marks}
            onChange={(e)=>setMarks(e.target.value)}
          />
        </div>

        <div>
          <label>Remarks</label>
          <textarea
            className="w-full text-black rounded p-2"
            rows={4}
            value={remarks}
            onChange={(e)=>setRemarks(e.target.value)}
          />
        </div>

        <button
          onClick={saveMarks}
          disabled={saving}
          className="bg-yellow-500 text-black px-6 py-3 rounded font-bold"
        >
          {saving ? "Saving..." : "Save Marks"}
        </button>
      </div>
    </main>
  );
}
