"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResultsPage() {

    const [results, setResults] = useState<any[]>([]);
    const [programmes, setProgrammes] = useState<any[]>([]);
const [selectedProgramme, setSelectedProgramme] = useState("");
const [students, setStudents] = useState<any[]>([]);
const [selectedStudent, setSelectedStudent] = useState("");
const [position, setPosition] = useState("");
const [preview, setPreview] = useState({
    
  studentName: "",
  programme: "",
  category: "",
  team: "",
});

useEffect(() => {
  loadProgrammes();
  loadResults();
}, []);
async function loadProgrammes() {
  const { data } = await supabase
    .from("programmes")
    .select("*")
    .order("programme_name");

  setProgrammes(data || []);
}

async function loadResults() {
  const { data, error } = await supabase
    .from("results")
    .select("*")
    
    .order("id", { ascending: false });

  if (error) {
   console.log(error);
    return;
  }

  setResults(data || []);
}

async function loadStudents(programmeId: string) {
  setSelectedProgramme(programmeId);

  const { data } = await supabase
    .from("registrations")
    .select("id, student_name, admission_no")
    .eq("programme_id", programmeId)
    .order("student_name");

  setStudents(data || []);
}

async function saveResult() {
  if (!selectedProgramme || !selectedStudent || !position) {
    alert("Please complete all fields.");
    return;
  }

  const points =
    position === "First"
      ? 10
      : position === "Second"
      ? 7
      : position === "Third"
      ? 5
      : 2;

  const { error } = await supabase.from("results").insert({
    programme_id: selectedProgramme,
    admission_no: selectedStudent,
    position,
    points,
    remarks: "",
  });

  if (error) {
    alert(error.message);
  } else {
   alert("✅ Result saved successfully!");
loadResults();
  }
}
  return (
    <div className="min-h-screen bg-gray-100">

      <div className="bg-blue-900 text-white p-6 shadow-lg">
        <h1 className="text-4xl font-bold">
          🏆 Results Management
        </h1>

        <p className="mt-2">
          Manage winners and team points.
        </p>
      </div>

      <div className="p-8">

        <div className="grid grid-cols-2 gap-8">

          {/* Result Entry */}
          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-6">
              Enter Result
            </h2>

            <div className="space-y-4">

              <select
  className="w-full border rounded-lg p-3"
  value={selectedProgramme}
  onChange={(e) => loadStudents(e.target.value)}
>
  <option value="">Select Programme</option>

  {programmes.map((programme) => (
    <option
      key={programme.id}
      value={programme.id}
    >
      {programme.programme_name}
    </option>
  ))}
</select>
              <select
  className="w-full border rounded-lg p-3"
  value={selectedStudent}
  onChange={async (e) => {
    const admissionNo = e.target.value;
    setSelectedStudent(admissionNo);

    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("admission_no", admissionNo)
      .single();

    if (!data) return;

    setPreview({
      studentName: data.student_name,
      programme:
        programmes.find(
          (p) => String(p.id) === String(selectedProgramme)
        )?.programme_name || "",
      category: data.category,
      team: data.team,
    });
  }}
>
  <option value="">Select Student</option>

  {students.map((student) => (
    <option
      key={student.id}
      value={student.admission_no}
    >
      {student.student_name}
    </option>
  ))}
</select>


              <select
  className="w-full border rounded-lg p-3"
  value={position}
  onChange={(e) => setPosition(e.target.value)}
>
  <option value="">Select Position</option>
  <option value="First">🥇 First Prize</option>
  <option value="Second">🥈 Second Prize</option>
  <option value="Third">🥉 Third Prize</option>
  <option value="Merit">⭐ Merit</option>
</select>
              <button
  onClick={saveResult}
  className="w-full bg-green-600 text-white rounded-lg p-3 font-bold"
>
  Save Result
</button>
            </div>

          </div>

          {/* Live Preview */}
          <div className="bg-white rounded-xl shadow p-6">

           <h2 className="text-2xl font-bold mb-6">
  Live Result Preview
</h2>

<div className="border rounded-xl p-8 text-center">

  <h1 className="text-4xl font-bold text-yellow-600">
  {position === "First" && "🥇 First Prize"}
  {position === "Second" && "🥈 Second Prize"}
  {position === "Third" && "🥉 Third Prize"}
  {position === "Merit" && "⭐ Merit"}
</h1>

  <h2 className="text-3xl mt-6">
    {preview.studentName}
  </h2>

  <p className="mt-4">
    {preview.programme}
  </p>

  <p>
    {preview.category}
  </p>

  <p>
    {preview.team}
  </p>

</div>

          </div>

        </div>   {/* Grid Ends */}

      
        <div className="mt-10 bg-white rounded-xl shadow p-6">

          <h2 className="text-2xl font-bold mb-6">
            Result History
          </h2>

          <table className="w-full border-collapse">

            <thead>

              <tr className="bg-blue-900 text-white">
                <th className="p-3">Programme</th>
                <th className="p-3">Admission No</th>
                <th className="p-3">Position</th>
                <th className="p-3">Points</th>
              </tr>

            </thead>

            <tbody>

              {results.map((result) => (
                <tr
                  key={result.id}
                  className="border-b hover:bg-gray-100"
                >
                  <td className="p-3">
  {result.programme_id}
</td>
                  <td className="p-3">{result.admission_no}</td>
                  <td className="p-3">{result.position}</td>
                  <td className="p-3 font-bold">{result.points}</td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>   {/* p-8 Ends */}

    </div>
  );
}