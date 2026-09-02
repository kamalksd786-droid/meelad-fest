"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Programme {
  id: number;
  programme_code: string;
  programme_name: string;
}

interface Participant {
  id: number;
  admission_no: string;
  student_name: string;
  class: string;
  team: string;
  category: string;
  programme_id: number;
  programme_code: string;
  programme_name: string;
  participant_type: string;
  event_type: string;
  point_rule: string;
  chest_no?: string | number | null;
}

interface StudentInfo {
  admission_no: string;
  chest_no?: string | number | null;
}

interface ScoreInput {
  marks: string;
  remarks: string;
}

interface ResultStudent extends Participant {
  marks: number;
  position: number;
}

export default function ScoreEntryPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [scores, setScores] = useState<Record<number, ScoreInput>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // -----------------------------
  // LOAD PROGRAMMES
  // -----------------------------

  useEffect(() => {
    loadProgrammes();
  }, []);

  async function loadProgrammes() {
    setLoading(true);

    const { data, error } = await supabase
      .from("programmes")
      .select("id, programme_code, programme_name")
      .order("programme_code");

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setProgrammes(data || []);
  }

  // -----------------------------
  // LOAD PARTICIPANTS + SCORES
  // -----------------------------

  async function loadParticipants(programmeId: number) {
    setLoading(true);
    setParticipants([]);
    setScores({});

    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("programme_id", programmeId)
      .order("student_name");

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    const registrationList = (data || []) as Participant[];

    // Get chest numbers from students table
    const admissionNumbers = Array.from(
      new Set(
        registrationList
          .map((item) => String(item.admission_no || "").trim())
          .filter(Boolean)
      )
    );

    let studentMap = new Map<string, StudentInfo>();

    if (admissionNumbers.length > 0) {
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("admission_no, chest_no")
        .in("admission_no", admissionNumbers);

      if (studentError) {
        console.error("Student lookup error:", studentError);
      } else {
        for (const student of (studentData || []) as StudentInfo[]) {
          studentMap.set(String(student.admission_no), student);
        }
      }
    }

    const studentList = registrationList.map((participant) => {
      const student = studentMap.get(
        String(participant.admission_no || "").trim()
      );

      return {
        ...participant,
        chest_no: participant.chest_no ?? student?.chest_no ?? null,
      };
    });

    setParticipants(studentList);

    // Load existing scores
    const { data: existingScores, error: scoreError } = await supabase
      .from("scores")
      .select("*")
      .eq("programme_id", String(programmeId));

    if (scoreError) {
      console.error("Score loading error:", scoreError);
      return;
    }

    const existing: Record<number, ScoreInput> = {};

    (existingScores || []).forEach((score: any) => {
      const registrationId = Number(score.registration_id);

      existing[registrationId] = {
        marks:
          score.marks !== null && score.marks !== undefined
            ? String(score.marks)
            : "",
        remarks: score.remarks || "",
      };
    });

    setScores(existing);
  }

  // -----------------------------
  // UPDATE MARKS
  // -----------------------------

  function updateMarks(id: number, value: string) {
    setScores((previous) => ({
      ...previous,
      [id]: {
        marks: value,
        remarks: previous[id]?.remarks || "",
      },
    }));
  }

  // -----------------------------
  // UPDATE REMARKS
  // -----------------------------

  function updateRemarks(id: number, value: string) {
    setScores((previous) => ({
      ...previous,
      [id]: {
        marks: previous[id]?.marks || "",
        remarks: value,
      },
    }));
  }

  // -----------------------------
  // SAVE SCORES
  // -----------------------------

  async function saveScores() {
    if (!selectedProgramme) {
      alert("Please select a programme.");
      return;
    }

    if (participants.length === 0) {
      alert("There are no participants for this programme.");
      return;
    }

    setSaving(true);

    try {
      for (const student of participants) {
        const score = scores[student.id];

        // Skip students without marks
        if (!score || score.marks.trim() === "") {
          continue;
        }

        const marks = Number(score.marks);

        if (Number.isNaN(marks)) {
          alert(`Invalid marks for ${student.student_name}`);
          setSaving(false);
          return;
        }

        if (marks < 0 || marks > 100) {
          alert(
            `Marks for ${student.student_name} must be between 0 and 100.`
          );
          setSaving(false);
          return;
        }

        // Check existing score
        const { data: existingScore, error: findError } = await supabase
          .from("scores")
          .select("id")
          .eq("registration_id", String(student.id))
          .eq("programme_id", String(student.programme_id))
          .limit(1)
          .maybeSingle();

        if (findError) {
          alert(findError.message);
          setSaving(false);
          return;
        }

        const scoreData = {
          registration_id: String(student.id),
          programme_id: String(student.programme_id),
          programme_code: student.programme_code,
          programme_name: student.programme_name,
          student_id: String(student.id),
          admission_no: student.admission_no,
          student_name: student.student_name,
          class: student.class,
          team: student.team,
          category: student.category,
          event_type: student.event_type,
          point_rule: student.point_rule,
          marks: marks,
          remarks: score.remarks,
        };

        let error;

        if (existingScore) {
          const result = await supabase
            .from("scores")
            .update(scoreData)
            .eq("id", existingScore.id);

          error = result.error;
        } else {
          const result = await supabase
            .from("scores")
            .insert(scoreData);

          error = result.error;
        }

        if (error) {
          alert(error.message);
          setSaving(false);
          return;
        }
      }

      alert("✅ Scores saved successfully!");

      await loadParticipants(Number(selectedProgramme));
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // JUDGE SHEET PRINT
  // -----------------------------

  function printJudgeSheet() {
    if (!selectedProgramme) {
      alert("Please select a programme first.");
      return;
    }

    window.print();
  }

  // -----------------------------
  // GET TOP 3 RESULTS
  // -----------------------------

  function getTopThree(): ResultStudent[] {
    const completed = participants
      .map((student) => {
        const markValue = scores[student.id]?.marks;

        if (!markValue || markValue.trim() === "") {
          return null;
        }

        const marks = Number(markValue);

        if (Number.isNaN(marks)) {
          return null;
        }

        return {
          ...student,
          marks,
          position: 0,
        };
      })
      .filter((student): student is ResultStudent => student !== null);

    // Highest marks first
    completed.sort((a, b) => {
      if (b.marks !== a.marks) {
        return b.marks - a.marks;
      }

      return a.student_name.localeCompare(b.student_name);
    });

    // Only first three
    const topThree = completed.slice(0, 3);

    return topThree.map((student, index) => ({
      ...student,
      position: index + 1,
    }));
  }

  // -----------------------------
  // PRINT RESULT
  // -----------------------------

  function printResult(size: "A4" | "A5") {
    if (!selectedProgramme) {
      alert("Please select a programme first.");
      return;
    }

    const topThree = getTopThree();

    if (topThree.length === 0) {
      alert("Please enter and save marks before printing the result.");
      return;
    }

    // Store requested print size on the body
    document.body.setAttribute("data-result-print-size", size);

    // Small delay allows React/browser to apply the print class
    setTimeout(() => {
      window.print();

      setTimeout(() => {
        document.body.removeAttribute("data-result-print-size");
      }, 500);
    }, 100);
  }

  const selectedProgrammeData = programmes.find(
    (programme) => String(programme.id) === selectedProgramme
  );

  const topThree = getTopThree();

  // -----------------------------
  // POSITION DISPLAY
  // -----------------------------

  function positionLabel(position: number) {
    if (position === 1) return "1st";
    if (position === 2) return "2nd";
    if (position === 3) return "3rd";
    return `${position}th`;
  }

  function positionIcon(position: number) {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return "";
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="bg-green-950 text-white rounded-2xl p-8 mb-8 shadow-lg">

          <h1 className="text-3xl md:text-4xl font-bold">
            📝 Mark Entry
          </h1>

          <p className="mt-2 text-green-200">
            Admin only — enter and save programme marks.
          </p>

        </div>

        {/* =========================================
            PROGRAMME SELECTION
        ========================================= */}

        <div className="bg-white rounded-2xl shadow p-6 mb-8">

          <label className="block font-bold text-lg mb-3">
            Select Programme
          </label>

          <select
            value={selectedProgramme}
            onChange={(e) => {
              const value = e.target.value;

              setSelectedProgramme(value);

              if (value) {
                loadParticipants(Number(value));
              } else {
                setParticipants([]);
                setScores({});
              }
            }}
            className="w-full md:w-[500px] border border-gray-300 rounded-lg p-3 text-black"
          >

            <option value="">
              -- Select Programme --
            </option>

            {programmes.map((programme) => (
              <option
                key={programme.id}
                value={programme.id}
              >
                {programme.programme_code} -{" "}
                {programme.programme_name}
              </option>
            ))}

          </select>

        </div>

        {/* =========================================
            LOADING
        ========================================= */}

        {loading && (
          <div className="bg-white rounded-2xl shadow p-8 text-center">

            <p className="text-gray-600 font-semibold">
              Loading...
            </p>

          </div>
        )}

        {/* =========================================
            PARTICIPANTS
        ========================================= */}

        {!loading && selectedProgramme && (

          <div className="bg-white rounded-2xl shadow p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

              <div>

                <h2 className="text-2xl font-bold">
                  Participants
                </h2>

                <p className="text-gray-500 mt-1">
                  {participants.length} participant(s)
                </p>

              </div>

              {/* BUTTONS */}

              <div className="flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={printJudgeSheet}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-lg"
                >
                  🖨️ Print Judge Sheet
                </button>

                <button
                  type="button"
                  onClick={saveScores}
                  disabled={saving || participants.length === 0}
                  className="bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-bold px-6 py-3 rounded-lg"
                >
                  {saving ? "Saving..." : "💾 Save Scores"}
                </button>

              </div>

            </div>

            {/* =========================================
                RESULT PRINT BUTTONS
            ========================================= */}

            <div className="border-t pt-6 mb-6">

              <h3 className="text-xl font-bold mb-2">
                🏆 Programme Result
              </h3>

              <p className="text-gray-600 mb-4">
                Print the 1st, 2nd and 3rd position holders for this
                programme.
              </p>

              <div className="flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={() => printResult("A4")}
                  disabled={topThree.length === 0}
                  className="bg-purple-700 hover:bg-purple-800 disabled:bg-gray-400 text-white font-bold px-6 py-3 rounded-lg"
                >
                  🖨️ Print Result — A4
                </button>

                <button
                  type="button"
                  onClick={() => printResult("A5")}
                  disabled={topThree.length === 0}
                  className="bg-indigo-700 hover:bg-indigo-800 disabled:bg-gray-400 text-white font-bold px-6 py-3 rounded-lg"
                >
                  🖨️ Print Result — A5
                </button>

              </div>

            </div>

            {/* =========================================
                PARTICIPANT TABLE
            ========================================= */}

            <div className="overflow-x-auto">

              <table className="w-full border-collapse">

                <thead>

                  <tr className="bg-green-900 text-white">

                    <th className="border p-3 text-left">
                      Admission No
                    </th>

                    <th className="border p-3 text-left">
                      Student
                    </th>

                    <th className="border p-3 text-left">
                      Class
                    </th>

                    <th className="border p-3 text-left">
                      Team
                    </th>

                    <th className="border p-3 text-left">
                      Category
                    </th>

                    <th className="border p-3 text-left">
                      Participant
                    </th>

                    <th className="border p-3 text-left">
                      Marks
                    </th>

                    <th className="border p-3 text-left">
                      Remarks
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {participants.length === 0 ? (

                    <tr>

                      <td
                        colSpan={8}
                        className="border p-8 text-center text-gray-500"
                      >
                        No participants registered for this programme.
                      </td>

                    </tr>

                  ) : (

                    participants.map((student) => (

                      <tr
                        key={student.id}
                        className="hover:bg-gray-50"
                      >

                        <td className="border p-3">
                          {student.admission_no}
                        </td>

                        <td className="border p-3 font-semibold">
                          {student.student_name}
                        </td>

                        <td className="border p-3">
                          {student.class}
                        </td>

                        <td className="border p-3 font-semibold">
                          {student.team}
                        </td>

                        <td className="border p-3">
                          {student.category}
                        </td>

                        <td className="border p-3">
                          {student.participant_type}
                        </td>

                        <td className="border p-3">

                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={
                              scores[student.id]?.marks || ""
                            }
                            onChange={(e) =>
                              updateMarks(
                                student.id,
                                e.target.value
                              )
                            }
                            className="w-24 border border-gray-300 rounded-lg p-2 text-black"
                            placeholder="Marks"
                          />

                        </td>

                        <td className="border p-3">

                          <input
                            type="text"
                            value={
                              scores[student.id]?.remarks || ""
                            }
                            onChange={(e) =>
                              updateRemarks(
                                student.id,
                                e.target.value
                              )
                            }
                            className="w-full min-w-[180px] border border-gray-300 rounded-lg p-2 text-black"
                            placeholder="Remarks"
                          />

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

            {/* =========================================
                SAVE ALL BUTTON
            ========================================= */}

            {participants.length > 0 && (

              <div className="flex justify-end mt-6">

                <button
                  type="button"
                  onClick={saveScores}
                  disabled={saving}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-black font-bold px-8 py-3 rounded-lg"
                >
                  {saving
                    ? "Saving..."
                    : "💾 Save All Scores"}
                </button>

              </div>

            )}

          </div>

        )}

        {/* =====================================================
            PRINTABLE JUDGE SHEET
        ===================================================== */}

        {selectedProgramme && (

          <section className="judge-sheet-print">

            <div className="judge-sheet-header">

              <h1>
                MUNAFASA 2026
              </h1>

              <h2>
                JUDGE SHEET
              </h2>

            </div>

            <div className="judge-details">

              <div>
                <strong>Programme ID:</strong>{" "}
                {selectedProgrammeData?.programme_code || ""}
              </div>

              <div>
                <strong>Programme Name:</strong>{" "}
                {selectedProgrammeData?.programme_name || ""}
              </div>

              <div>
                <strong>Category:</strong>{" "}
                {participants[0]?.category || ""}
              </div>

              <div>
                <strong>Programme Type:</strong>{" "}
                {participants[0]?.participant_type || ""}
              </div>

              <div>
                <strong>Date:</strong>{" "}
                {new Date().toLocaleDateString("en-IN")}
              </div>

            </div>

            <table className="judge-table">

              <thead>

                <tr>

                  <th>Sl. No.</th>
                  <th>Chest No.</th>
                  <th>Mark 1</th>
                  <th>Mark 2</th>
                  <th>Mark 3</th>
                  <th>Mark 4</th>
                  <th>Total</th>
                  <th>Position</th>

                </tr>

              </thead>

              <tbody>

                {participants.length > 0 ? (

                  participants.map((participant, index) => (

                    <tr key={`judge-${participant.id}`}>

                      <td>{index + 1}</td>

                      <td>
                        {participant.chest_no ?? ""}
                      </td>

                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>

                    </tr>

                  ))

                ) : (

                  Array.from({ length: 10 }).map((_, index) => (

                    <tr key={`blank-judge-${index}`}>

                      <td>{index + 1}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

            <div className="judge-footer">

              <div>
                <strong>Judge Name:</strong>
                <span className="signature-line"></span>
              </div>

              <div>
                <strong>Judge Signature:</strong>
                <span className="signature-line"></span>
              </div>

            </div>

            <div className="remarks-area">

              <strong>Remarks:</strong>

              <div className="remarks-line"></div>
              <div className="remarks-line"></div>

            </div>

          </section>

        )}

        {/* =====================================================
            PRINTABLE RESULT SHEET
        ===================================================== */}

        {selectedProgramme && (

          <section className="result-print">

            <div className="result-school-name">
              THE GLOBAL PUBLIC SCHOOL
            </div>

            <div className="result-event-name">
              MUNAFASA 2026
            </div>

            <div className="result-title">
              PROGRAMME RESULT
            </div>

            <div className="result-programme-box">

              <div>
                <strong>Programme:</strong>{" "}
                {selectedProgrammeData?.programme_name || ""}
              </div>

              <div>
                <strong>Programme Code:</strong>{" "}
                {selectedProgrammeData?.programme_code || ""}
              </div>

              <div>
                <strong>Category:</strong>{" "}
                {participants[0]?.category || ""}
              </div>

              <div>
                <strong>Date:</strong>{" "}
                {new Date().toLocaleDateString("en-IN")}
              </div>

            </div>

            <table className="result-table">

              <thead>

                <tr>

                  <th className="position-column">
                    Position
                  </th>

                  <th>
                    Student Name
                  </th>

                  <th>
                    Chest No.
                  </th>

                  <th>
                    Class
                  </th>

                  <th>
                    Team
                  </th>

                  <th>
                    Marks
                  </th>

                </tr>

              </thead>

              <tbody>

                {topThree.map((student) => (

                  <tr key={`result-${student.id}`}>

                    <td className="position-cell">

                      <span className="position-icon">
                        {positionIcon(student.position)}
                      </span>

                      <strong>
                        {positionLabel(student.position)}
                      </strong>

                    </td>

                    <td className="student-name-cell">
                      {student.student_name}
                    </td>

                    <td>
                      {student.chest_no ?? ""}
                    </td>

                    <td>
                      {student.class}
                    </td>

                    <td className="team-cell">
                      {student.team}
                    </td>

                    <td className="marks-cell">
                      {student.marks}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            <div className="result-signatures">

              <div>
                <span></span>
                <strong>Judge Signature</strong>
              </div>

              <div>
                <span></span>
                <strong>Admin / Coordinator</strong>
              </div>

            </div>

            <div className="result-footer">
              MUNAFASA 2026 — THE GLOBAL PUBLIC SCHOOL
            </div>

          </section>

        )}

      </div>

      {/* =====================================================
          PRINT STYLES
      ===================================================== */}

      <style jsx global>{`

        /* =========================================
           NORMAL PAGE
        ========================================= */

        .judge-sheet-print,
        .result-print {
          display: none;
        }


        /* =========================================
           JUDGE SHEET PRINT
        ========================================= */

        @media print {

          body {
            background: white !important;
          }

          body * {
            visibility: hidden !important;
          }

          .judge-sheet-print,
          .judge-sheet-print * {
            visibility: visible !important;
          }

          .judge-sheet-print {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            color: black;
            font-family: Arial, Helvetica, sans-serif;
          }

          @page {
            size: A4 portrait;
            margin: 12mm;
          }

          .judge-sheet-header {
            text-align: center;
            margin-bottom: 18px;
          }

          .judge-sheet-header h1 {
            margin: 0;
            font-size: 25px;
            font-weight: 800;
          }

          .judge-sheet-header h2 {
            margin: 5px 0 0;
            font-size: 18px;
            font-weight: 700;
          }

          .judge-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 9px 24px;
            border: 1px solid #222;
            padding: 12px;
            margin-bottom: 18px;
            font-size: 12px;
          }

          .judge-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          .judge-table th,
          .judge-table td {
            border: 1px solid #222;
            text-align: center;
            padding: 7px 5px;
            height: 31px;
            font-size: 11px;
          }

          .judge-table th {
            font-weight: 700;
            background: #f0f0f0 !important;
          }

          .judge-footer {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 35px;
            margin-top: 28px;
            font-size: 12px;
          }

          .signature-line {
            display: inline-block;
            width: 150px;
            border-bottom: 1px solid #222;
            margin-left: 8px;
            height: 16px;
            vertical-align: bottom;
          }

          .remarks-area {
            margin-top: 22px;
            font-size: 12px;
          }

          .remarks-line {
            border-bottom: 1px solid #222;
            height: 25px;
            margin-top: 4px;
          }

        }


        /* =========================================
           RESULT PRINT
        ========================================= */

        @media print {

          body[data-result-print-size="A4"] .result-print,
          body[data-result-print-size="A5"] .result-print,
          body[data-result-print-size="A4"] .result-print *,
          body[data-result-print-size="A5"] .result-print * {
            visibility: visible !important;
          }

          body[data-result-print-size="A4"] .result-print,
          body[data-result-print-size="A5"] .result-print {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            color: black;
            font-family: Arial, Helvetica, sans-serif;
          }

          body[data-result-print-size="A4"] *:not(.result-print):not(.result-print *),
          body[data-result-print-size="A5"] *:not(.result-print):not(.result-print *) {
            visibility: hidden !important;
          }

          .result-school-name {
            text-align: center;
            font-size: 25px;
            font-weight: 800;
            margin-top: 5px;
          }

          .result-event-name {
            text-align: center;
            font-size: 21px;
            font-weight: 700;
            margin-top: 5px;
          }

          .result-title {
            text-align: center;
            font-size: 18px;
            font-weight: 800;
            margin-top: 12px;
            border-bottom: 2px solid #111;
            padding-bottom: 8px;
          }

          .result-programme-box {
            border: 1px solid #222;
            padding: 12px;
            margin-top: 16px;
            margin-bottom: 18px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 20px;
            font-size: 12px;
          }

          .result-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          .result-table th,
          .result-table td {
            border: 1px solid #222;
            text-align: center;
            padding: 9px 6px;
            font-size: 12px;
          }

          .result-table th {
            background: #eeeeee !important;
            font-weight: 800;
          }

          .result-table .position-column {
            width: 16%;
          }

          .position-cell {
            font-size: 14px;
            white-space: nowrap;
          }

          .position-icon {
            font-size: 18px;
            margin-right: 4px;
          }

          .student-name-cell {
            text-align: left !important;
            font-weight: 700;
          }

          .team-cell {
            font-weight: 700;
          }

          .marks-cell {
            font-weight: 800;
          }

          .result-signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            margin-top: 55px;
            text-align: center;
            font-size: 11px;
          }

          .result-signatures div {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 7px;
          }

          .result-signatures span {
            display: block;
            width: 160px;
            border-bottom: 1px solid #222;
            height: 22px;
          }

          .result-footer {
            text-align: center;
            margin-top: 35px;
            font-size: 10px;
            font-weight: 600;
          }

        }


        /* =========================================
           A4
        ========================================= */

        @media print {

          @page {
            size: A4 portrait;
            margin: 12mm;
          }

          body[data-result-print-size="A4"] .result-school-name {
            font-size: 25px;
          }

          body[data-result-print-size="A4"] .result-event-name {
            font-size: 21px;
          }

          body[data-result-print-size="A4"] .result-table th,
          body[data-result-print-size="A4"] .result-table td {
            padding: 10px 7px;
            font-size: 12px;
          }

        }


        /* =========================================
           A5
        ========================================= */

        @media print {

          body[data-result-print-size="A5"] .result-print {
            width: 100%;
          }

          body[data-result-print-size="A5"] .result-school-name {
            font-size: 18px;
          }

          body[data-result-print-size="A5"] .result-event-name {
            font-size: 16px;
          }

          body[data-result-print-size="A5"] .result-title {
            font-size: 14px;
            margin-top: 8px;
            padding-bottom: 5px;
          }

          body[data-result-print-size="A5"] .result-programme-box {
            padding: 7px;
            margin-top: 9px;
            margin-bottom: 10px;
            gap: 5px 10px;
            font-size: 9px;
          }

          body[data-result-print-size="A5"] .result-table th,
          body[data-result-print-size="A5"] .result-table td {
            padding: 6px 4px;
            font-size: 9px;
          }

          body[data-result-print-size="A5"] .position-cell {
            font-size: 10px;
          }

          body[data-result-print-size="A5"] .position-icon {
            font-size: 13px;
          }

          body[data-result-print-size="A5"] .result-signatures {
            margin-top: 30px;
            gap: 20px;
            font-size: 9px;
          }

          body[data-result-print-size="A5"] .result-signatures span {
            width: 110px;
            height: 15px;
          }

          body[data-result-print-size="A5"] .result-footer {
            margin-top: 20px;
            font-size: 8px;
          }

        }

      `}</style>

    </main>
  );
}