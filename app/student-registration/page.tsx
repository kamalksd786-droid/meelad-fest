"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../../lib/supabase";

export default function StudentRegistrationPage() {
  const [search, setSearch] = useState("");
  const [student, setStudent] = useState<any>(null);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [selectedProgrammes, setSelectedProgrammes] = useState<number[]>([]);

  async function searchStudent(value: string) {
    setSearch(value);

    if (value.trim() === "") {
      setStudent(null);
      setProgrammes([]);
      setSelectedProgrammes([]);
      return;
    }

    const searchValue = value.trim();

    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("*")
      .or(
        `admission_no.ilike.%${searchValue}%,student_name.ilike.%${searchValue}%`
      )
      .limit(1)
      .maybeSingle();

    if (studentError || !studentData) {
      setStudent(null);
      setProgrammes([]);
      setSelectedProgrammes([]);
      return;
    }

    setStudent(studentData);

    // Load programmes for the student's category
   const { data: allProgrammes, error: programmeError } = await supabase
  .from("programmes")
  .select("*")
  .order("programme_name");

if (programmeError) {
  console.error("Programme loading error:", programmeError);
  setProgrammes([]);
} else {

  const normalizeCategory = (value: string) =>
    String(value || "")
      .toLowerCase()
      .replace(/[\s_-]/g, "");

  const studentCategory = normalizeCategory(
    studentData.category
  );

  const matchingProgrammes = (allProgrammes || []).filter(
    (programme: any) =>
      normalizeCategory(programme.category) === studentCategory
  );

  setProgrammes(matchingProgrammes);
}
    // Load existing registrations using Admission No.
    // DO NOT use student_id because that column does not exist.
    const { data: registered, error: registrationError } = await supabase
      .from("registrations")
      .select("programme_id")
      .eq("admission_no", studentData.admission_no)
      .is("teacher_id", null);

    if (registrationError) {
      console.error("Registration loading error:", registrationError);
      setSelectedProgrammes([]);
    } else {
      setSelectedProgrammes(
        registered
          ? registered.map((r: any) => Number(r.programme_id))
          : []
      );
    }
  }

  async function saveRegistration() {
    if (!student) {
      alert("Please search and select a student.");
      return;
    }

    if (selectedProgrammes.length === 0) {
      alert("Please select at least one programme.");
      return;
    }

    // Delete only parent/student-portal registrations.
    // Teacher registrations will NOT be deleted.
    const { error: deleteError } = await supabase
      .from("registrations")
      .delete()
      .eq("admission_no", student.admission_no)
      .is("teacher_id", null);

    if (deleteError) {
      alert(deleteError.message);
      return;
    }

    const rows = programmes
      .filter((programme) =>
        selectedProgrammes.includes(Number(programme.id))
      )
      .map((programme) => ({
        programme_id: programme.id,

        admission_no: student.admission_no,
        student_name: student.student_name,
        class: student.class,
        category: student.category,
        team: student.team,

        programme_code: programme.programme_code,
        programme_name: programme.programme_name,
        participant_type: programme.participant_type,
        venue_type: programme.venue_type,
        gender: programme.gender,
        event_type: programme.event_type,
        point_rule: programme.point_rule,

        status: "Registered",
      }));

    if (rows.length === 0) {
      alert("No valid programmes selected.");
      return;
    }

    const { error } = await supabase
      .from("registrations")
      .insert(rows);

    if (error) {
      alert(error.message);
      return;
    }

    alert("✅ Registration Updated Successfully!");

    // Reload registrations so the selected programmes remain correct
    const { data: registered } = await supabase
      .from("registrations")
      .select("programme_id")
      .eq("admission_no", student.admission_no)
      .is("teacher_id", null);

    setSelectedProgrammes(
      registered
        ? registered.map((r: any) => Number(r.programme_id))
        : []
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-green-950 text-white p-8">

        <div className="max-w-6xl mx-auto bg-green-900 rounded-xl p-8">

          <h1 className="text-4xl font-bold mb-8">
            Student Programme Registration
          </h1>

          <input
            type="text"
            placeholder="Search Admission No or Student Name"
            value={search}
            onChange={(e) => searchStudent(e.target.value)}
            className="w-full p-3 rounded text-black mb-6"
          />

          {!student && (
            <div className="border rounded-lg p-6">
              Search a student to begin registration.
            </div>
          )}

          {student && (
            <>
              {/* STUDENT DETAILS */}

              <div className="bg-green-800 rounded-lg p-6 mb-6">

                <h2 className="text-2xl font-bold mb-4">
                  Student Details
                </h2>

                <p>
                  <strong>Admission No:</strong>{" "}
                  {student.admission_no}
                </p>

                <p>
                  <strong>Name:</strong>{" "}
                  {student.student_name}
                </p>

                <p>
                  <strong>Class:</strong>{" "}
                  {student.class || "-"}
                </p>

                <p>
                  <strong>Category:</strong>{" "}
                  {student.category}
                </p>

                <p>
                  <strong>Team:</strong>{" "}
                  {student.team}
                </p>

              </div>

              {/* PROGRAMMES */}

              <div className="bg-green-800 rounded-lg p-6">

                <h2 className="text-2xl font-bold mb-4">
                  Available Programmes
                </h2>

                {programmes.length === 0 ? (
                  <p className="text-yellow-300">
                    No programmes found for category:{" "}
                    {student.category}
                  </p>
                ) : (
                  programmes.map((programme) => (

                    <div
                      key={programme.id}
                      className="flex items-center gap-3 mb-3 border-b border-green-700 pb-2"
                    >

                      <input
                        type="checkbox"
                        checked={selectedProgrammes.includes(
                          Number(programme.id)
                        )}
                        onChange={(e) => {

                          if (e.target.checked) {

                            setSelectedProgrammes([
                              ...selectedProgrammes,
                              Number(programme.id),
                            ]);

                          } else {

                            setSelectedProgrammes(
                              selectedProgrammes.filter(
                                (id) =>
                                  id !== Number(programme.id)
                              )
                            );

                          }

                        }}
                      />

                      <div className="flex-1">

                        <div className="font-semibold">
                          {programme.programme_code} -{" "}
                          {programme.programme_name}
                        </div>

                        <div className="text-sm text-yellow-300">
                          {programme.participant_type}{" "}
                          |{" "}
                          {programme.gender || "-"}{" "}
                          |{" "}
                          {programme.venue_type}
                        </div>

                      </div>

                    </div>

                  ))
                )}

                <div className="mt-6 flex justify-between items-center">

                  <p className="text-yellow-300 font-bold">
                    Selected Programmes :{" "}
                    {selectedProgrammes.length}
                  </p>

                  <button
                    onClick={saveRegistration}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-bold"
                  >
                    Save Registration
                  </button>

                </div>

              </div>
            </>
          )}

        </div>

      </main>
    </>
  );
}