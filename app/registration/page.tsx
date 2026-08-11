"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegistrationPage() {
  const [admissionNo, setAdmissionNo] = useState("");
  const [student, setStudent] = useState<any>(null);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const stageProgrammes = programmes.filter(p => p.section === "Stage");
const offStageProgrammes = programmes.filter(p => p.section === "Off Stage");
const generalProgrammes = programmes.filter(p => p.section === "General");
const groupProgrammes = programmes.filter(p => p.section === "Group");
  const [selectedProgrammes, setSelectedProgrammes] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  async function searchStudent() {
    if (!admissionNo.trim()) {
      alert("Enter Admission Number");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("admission_no", admissionNo)
      .maybeSingle();

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    if (!data) {
      setLoading(false);
      setStudent(null);
      setProgrammes([]);
      alert("Student not found");
      return;
    }

    setStudent(data);

    const { data: programmeData, error: programmeError } =
      await supabase
        .from("programmes")
        .select("*")
        .eq("category", data.category)
        .order("programme_name");

    setLoading(false);

    if (programmeError) {
      alert(programmeError.message);
      return;
    }

    setProgrammes(programmeData || []);
    setSelectedProgrammes([]);
  }

  async function saveRegistration() {
    if (!student) {
      alert("Search a student first.");
      return;
    }

    if (selectedProgrammes.length === 0) {
      alert("Select at least one programme.");
      return;
    }

    for (const programmeId of selectedProgrammes) {
      const programme = programmes.find((p) => p.id === programmeId);

      if (!programme) continue;

      const { data: existing } = await supabase
        .from("registrations")
        .select("id")
        .eq("admission_no", student.admission_no)
        .eq("programme_code", programme.programme_code)
        .maybeSingle();

      if (existing) {
        continue;
      }

      const { error } = await supabase
        .from("registrations")
        .insert({
          admission_no: student.admission_no,
          student_name: student.student_name,
          class: student.class,
          category: student.category,
          team: student.team,
          programme_code: programme.programme_code,
          programme_name: programme.programme_name,
          participant_type: programme.participant_type,
          status: "Registered",
        });

      if (error) {
        alert(error.message);
        return;
      }
    }

    alert("Registration saved successfully.");

    setSelectedProgrammes([]);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold text-purple-700 mb-8">
          Programme Registration
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">

          <div className="flex gap-4">

            <input
              type="text"
              placeholder="Enter Admission Number"
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value)}
              className="border rounded-lg p-3 flex-1"
            />

            <button
              onClick={searchStudent}
              className="bg-purple-700 text-white px-6 rounded-lg"
            >
              {loading ? "Searching..." : "Search"}
            </button>

          </div>

        </div>

        {student && (

          <>
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">

              <h2 className="text-2xl font-bold text-purple-700 mb-4">
                Student Details
              </h2>

              <div className="grid md:grid-cols-2 gap-4">

                <p><strong>Name:</strong> {student.student_name}</p>

                <p><strong>Admission No:</strong> {student.admission_no}</p>

                <p><strong>Class:</strong> {student.class}</p>

                <p><strong>Category:</strong> {student.category}</p>

                <p><strong>Team:</strong> {student.team}</p>

              </div>

            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">

              <h2 className="text-2xl font-bold text-purple-700 mb-4">
                Available Programmes
              </h2>

              {programmes.length === 0 ? (

                <p>No programmes available.</p>

              ) : (

                <div className="space-y-3">

                  {programmes.map((programme) => (

                    <label
                      key={programme.id}
                      className="flex items-center gap-3 border rounded-lg p-3 hover:bg-gray-100"
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

                        <div className="font-semibold">
                          {programme.programme_code} - {programme.programme_name}
                        </div>

                        <div className="text-sm text-gray-500">
                          {programme.participant_type}
                        </div>

                      </div>

                    </label>

                  ))}

                </div>

              )}

              <button
                onClick={saveRegistration}
                className="mt-6 bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800"
              >
                Save Registration
              </button>

            </div>

          </>

        )}

      </div>

    </div>
  );
}