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
}

interface ScoreInput {
  marks: string;
  remarks: string;
}

export default function ScoreEntryPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [scores, setScores] = useState<Record<number, ScoreInput>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

    const studentList = (data || []) as Participant[];

    setParticipants(studentList);

    /*
      Load already saved scores for this programme.
      This allows Admin to edit previously entered marks.
    */

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

  function updateMarks(id: number, value: string) {
    setScores((previous) => ({
      ...previous,
      [id]: {
        marks: value,
        remarks: previous[id]?.remarks || "",
      },
    }));
  }

  function updateRemarks(id: number, value: string) {
    setScores((previous) => ({
      ...previous,
      [id]: {
        marks: previous[id]?.marks || "",
        remarks: value,
      },
    }));
  }

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

        /*
          Skip students for whom Admin has not entered marks.
        */

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

        /*
          Check whether a score already exists.
        */

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

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="bg-green-950 text-white rounded-2xl p-8 mb-8 shadow-lg">

          <h1 className="text-3xl md:text-4xl font-bold">
            📝 Mark Entry
          </h1>

          <p className="mt-2 text-green-200">
            Admin only — enter and save programme marks.
          </p>

        </div>

        {/* PROGRAMME SELECTION */}

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

        {/* LOADING */}

        {loading && (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <p className="text-gray-600 font-semibold">
              Loading...
            </p>
          </div>
        )}

        {/* PARTICIPANTS */}

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

              <button
                type="button"
                onClick={saveScores}
                disabled={saving || participants.length === 0}
                className="bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-bold px-6 py-3 rounded-lg"
              >
                {saving
                  ? "Saving..."
                  : "💾 Save Scores"}
              </button>

            </div>

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
                        No participants registered for this
                        programme.
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

      </div>
    </main>
  );
}