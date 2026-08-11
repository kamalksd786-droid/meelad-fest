"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Student = {
  admission_no: string;
  chest_no: string;
  student_name: string;
  team: string;
};

type Programme = {
  id: number;
  programme_name: string;
  category: string;
  programme_type: string;
};

type Result = {
  id: number;
  programme_id: number;
  programme_name: string;
  category: string;
  admission_no: string;
  student_name: string;
  team: string;
  position: string;
  points: number;
  group_result_id: string | null;
};

export default function ResultEntryPage() {
  const [search, setSearch] = useState("");
  const [student, setStudent] = useState<Student | null>(null);

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");

  const [groupStudents, setGroupStudents] = useState<Student[]>([]);

  useEffect(() => {
    loadProgrammes();
    loadResults();
  }, []);

  async function loadProgrammes() {
    const { data, error } = await supabase
      .from("programmes")
      .select("id, programme_name, category, programme_type")
      .order("id");

    if (error) {
      alert(error.message);
      return;
    }

    setProgrammes(data || []);
  }

  async function loadResults() {
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setResults(data || []);
  }

  async function searchStudent(value: string) {
    setSearch(value);

    if (!value.trim()) {
      setStudent(null);
      return;
    }

    const { data, error } = await supabase
      .from("students")
      .select("admission_no, chest_no, student_name, team")
      .or(`admission_no.eq.${value},chest_no.eq.${value}`)
      .maybeSingle();

    if (error) {
      console.error(error);
      setStudent(null);
      return;
    }

    setStudent(data || null);
  }

  function getSelectedProgramme() {
    return programmes.find(
      (programme) => programme.id === Number(selectedProgramme)
    );
  }

  function calculatePoints(
    programmeType: string,
    position: string
  ) {
    if (programmeType === "Individual") {
      if (position === "First") return 5;
      if (position === "Second") return 3;
      if (position === "Third") return 1;
    }

    if (programmeType === "Group") {
      if (position === "First") return 10;
      if (position === "Second") return 5;
      if (position === "Third") return 3;
    }

    if (programmeType === "General") {
      if (position === "First") return 15;
      if (position === "Second") return 7;
      if (position === "Third") return 5;
    }

    return 0;
  }

  function addGroupStudent() {
    if (!student) {
      alert("Search for a student first.");
      return;
    }

    const programme = getSelectedProgramme();

    if (!programme) {
      alert("Please select a Programme ID first.");
      return;
    }

    if (programme.programme_type !== "Group") {
      alert("This is not a Group programme.");
      return;
    }

    const alreadyAdded = groupStudents.some(
      (s) => s.admission_no === student.admission_no
    );

    if (alreadyAdded) {
      alert("This student is already added.");
      return;
    }

    if (groupStudents.length > 0) {
      const existingTeam = groupStudents[0].team?.toUpperCase();
      const newTeam = student.team?.toUpperCase();

      if (existingTeam !== newTeam) {
        alert(
          `All students in a group must belong to the same team.\n\nExisting Team: ${existingTeam}\nStudent Team: ${newTeam}`
        );
        return;
      }
    }

    setGroupStudents([...groupStudents, student]);
    setStudent(null);
    setSearch("");
  }

  function removeGroupStudent(admissionNo: string) {
    setGroupStudents(
      groupStudents.filter(
        (student) => student.admission_no !== admissionNo
      )
    );
  }

  async function saveResult() {
    const programme = getSelectedProgramme();

    if (!programme) {
      alert("Please select a Programme ID.");
      return;
    }

    if (!selectedPosition) {
      alert("Please select a position.");
      return;
    }

    /*
      GROUP PROGRAMME
    */
    if (programme.programme_type === "Group") {
      if (groupStudents.length === 0) {
        alert("Please add at least one student to the group.");
        return;
      }

      const { data: existing, error: duplicateError } = await supabase
        .from("results")
        .select("id")
        .eq("programme_id", programme.id)
        .eq("position", selectedPosition)
        .limit(1);

      if (duplicateError) {
        alert(duplicateError.message);
        return;
      }

      if (existing && existing.length > 0) {
        alert(
          `${selectedPosition} is already assigned for Programme ID ${programme.id}.`
        );
        return;
      }

      const groupResultId =
  "GRP-" + Date.now() + "-" + Math.floor(Math.random() * 100000);

      const points = calculatePoints(
        programme.programme_type,
        selectedPosition
      );

      const rows = groupStudents.map((member) => ({
        programme_id: programme.id,
        programme_name: programme.programme_name,
        category: programme.category,
        admission_no: member.admission_no,
        student_name: member.student_name,
        team: member.team?.toUpperCase() || "",
        position: selectedPosition,
        points: points,
        published: false,
        group_result_id: groupResultId,
      }));

      const { error } = await supabase
        .from("results")
        .insert(rows);

      if (error) {
        alert(error.message);
        return;
      }

      alert(
        `✅ Group Result Saved\n\n${groupStudents.length} students added.\n${selectedPosition} — ${programme.programme_name}`
      );

      setGroupStudents([]);
      setSelectedProgramme("");
      setSelectedPosition("");
      setSearch("");
      setStudent(null);

      loadResults();

      return;
    }

    /*
      INDIVIDUAL / GENERAL PROGRAMME
    */

    if (!student) {
      alert("Please select a student.");
      return;
    }

    const points = calculatePoints(
      programme.programme_type,
      selectedPosition
    );

    if (points === 0) {
      alert("Points could not be calculated.");
      return;
    }

    const { data: existing, error: duplicateError } = await supabase
      .from("results")
      .select("id")
      .eq("programme_id", programme.id)
      .eq("position", selectedPosition)
      .limit(1);

    if (duplicateError) {
      alert(duplicateError.message);
      return;
    }

    if (existing && existing.length > 0) {
      alert(
        `${selectedPosition} is already assigned for Programme ID ${programme.id}.`
      );
      return;
    }

    const { error } = await supabase
      .from("results")
      .insert({
        programme_id: programme.id,
        programme_name: programme.programme_name,
        category: programme.category,
        admission_no: student.admission_no,
        student_name: student.student_name,
        team: student.team?.toUpperCase() || "",
        position: selectedPosition,
        points: points,
        published: false,
        group_result_id: null,
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("✅ Result Saved Successfully");

    setSearch("");
    setStudent(null);
    setSelectedProgramme("");
    setSelectedPosition("");

    loadResults();
  }

  async function deleteResult(id: number) {
    const ok = confirm("Delete this result?");

    if (!ok) return;

    const { error } = await supabase
      .from("results")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadResults();
  }

  const selectedProgrammeData = getSelectedProgramme();

  const isGroup =
    selectedProgrammeData?.programme_type === "Group";

  const previewStudents = isGroup
    ? groupStudents
    : student
    ? [student]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <h1 className="text-4xl font-bold mb-8">
        🏆 Result Entry
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* LEFT SIDE */}

        <div className="bg-white shadow rounded-xl p-6">

          <h2 className="text-2xl font-bold mb-5">
            Enter Result
          </h2>

          {/* PROGRAMME */}

          <label className="font-semibold block mb-2">
            Programme ID
          </label>

          <select
            className="border rounded-lg w-full p-3 mb-4"
            value={selectedProgramme}
            onChange={(e) => {
              setSelectedProgramme(e.target.value);
              setGroupStudents([]);
              setStudent(null);
              setSearch("");
              setSelectedPosition("");
            }}
          >

            <option value="">
              Select Programme ID
            </option>

            {programmes.map((programme) => (
              <option
                key={programme.id}
                value={programme.id}
              >
                {programme.id} | {programme.category} |{" "}
                {programme.programme_name}
              </option>
            ))}

          </select>

          {/* PROGRAMME INFORMATION */}

          {selectedProgrammeData && (

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">

              <p>
                <b>Programme ID:</b>{" "}
                {selectedProgrammeData.id}
              </p>

              <p>
                <b>Category:</b>{" "}
                {selectedProgrammeData.category}
              </p>

              <p>
                <b>Programme:</b>{" "}
                {selectedProgrammeData.programme_name}
              </p>

              <p>
                <b>Type:</b>{" "}
                {selectedProgrammeData.programme_type}
              </p>

            </div>

          )}

          {/* STUDENT SEARCH */}

          <label className="font-semibold block mb-2">
            {isGroup ? "Add Group Student" : "Student"}
          </label>

          <input
            className="border rounded-lg w-full p-3 mb-3"
            placeholder="Chest No / Admission No"
            value={search}
            onChange={(e) =>
              searchStudent(e.target.value)
            }
          />

          {student && (

            <div className="bg-gray-100 rounded-lg p-4 mb-4">

              <p>
                <b>Name:</b>{" "}
                {student.student_name}
              </p>

              <p>
                <b>Admission:</b>{" "}
                {student.admission_no}
              </p>

              <p>
                <b>Chest:</b>{" "}
                {student.chest_no}
              </p>

              <p>
                <b>Team:</b>{" "}
                {student.team}
              </p>

              {isGroup && (
                <button
                  type="button"
                  onClick={addGroupStudent}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold"
                >
                  ➕ Add Student
                </button>
              )}

            </div>

          )}

          {/* GROUP STUDENTS */}

          {isGroup && groupStudents.length > 0 && (

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5">

              <div className="flex justify-between items-center mb-3">

                <h3 className="font-bold text-lg">
                  👥 Group Students
                </h3>

                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                  {groupStudents.length} Students
                </span>

              </div>

              {groupStudents.map((member, index) => (

                <div
                  key={member.admission_no}
                  className="flex items-center justify-between bg-white border rounded-lg p-3 mb-2"
                >

                  <div>
                    <b>
                      {index + 1}. {member.student_name}
                    </b>

                    <div className="text-sm text-gray-500">
                      Admission: {member.admission_no} | Team:{" "}
                      {member.team}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeGroupStudent(member.admission_no)
                    }
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Remove
                  </button>

                </div>

              ))}

            </div>

          )}

          {/* POSITION */}

          <label className="font-semibold block mb-2">
            Position
          </label>

          <select
            className="border rounded-lg w-full p-3 mb-4"
            value={selectedPosition}
            onChange={(e) =>
              setSelectedPosition(e.target.value)
            }
          >

            <option value="">
              Select Position
            </option>

            <option value="First">
              🥇 First
            </option>

            <option value="Second">
              🥈 Second
            </option>

            <option value="Third">
              🥉 Third
            </option>

          </select>

          {/* SAVE */}

          <button
            onClick={saveResult}
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg w-full font-bold"
          >
            💾 Save Result
          </button>

        </div>


        {/* RIGHT SIDE */}

        <div className="bg-white shadow rounded-xl p-6">

          <h2 className="text-2xl font-bold mb-5">
            Live Preview
          </h2>

          {!selectedProgrammeData ? (

            <p className="text-gray-500">
              Select a programme.
            </p>

          ) : (

            <div className="space-y-3">

              <p>
                <b>Programme ID:</b>{" "}
                {selectedProgrammeData.id}
              </p>

              <p>
                <b>Category:</b>{" "}
                {selectedProgrammeData.category}
              </p>

              <p>
                <b>Programme:</b>{" "}
                {selectedProgrammeData.programme_name}
              </p>

              <p>
                <b>Type:</b>{" "}
                {selectedProgrammeData.programme_type}
              </p>

              {isGroup ? (

                <div>

                  <p className="font-bold mb-2">
                    👥 Group Students:
                  </p>

                  {previewStudents.length === 0 ? (

                    <p className="text-gray-500">
                      No students added yet.
                    </p>

                  ) : (

                    previewStudents.map((member, index) => (

                      <p key={member.admission_no}>
                        {index + 1}.{" "}
                        {member.student_name}
                      </p>

                    ))

                  )}

                </div>

              ) : (

                <p>
                  <b>Student:</b>{" "}
                  {student?.student_name || "-"}
                </p>

              )}

              <p>
                <b>Team:</b>{" "}
                {previewStudents[0]?.team || "-"}
              </p>

              <p>
                <b>Position:</b>{" "}
                {selectedPosition || "-"}
              </p>

              <p>
                <b>Points:</b>{" "}
                {selectedPosition
                  ? calculatePoints(
                      selectedProgrammeData.programme_type,
                      selectedPosition
                    )
                  : "-"}
              </p>

            </div>

          )}

        </div>

      </div>


      {/* RESULT HISTORY */}

      <div className="mt-10">

        <h2 className="text-2xl font-bold mb-5">
          Result History
        </h2>

        <div className="bg-white shadow rounded-xl overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="border p-3">
                  Programme ID
                </th>

                <th className="border p-3">
                  Category
                </th>

                <th className="border p-3">
                  Programme
                </th>

                <th className="border p-3">
                  Student
                </th>

                <th className="border p-3">
                  Team
                </th>

                <th className="border p-3">
                  Position
                </th>

                <th className="border p-3">
                  Points
                </th>

                <th className="border p-3">
                  Group ID
                </th>

                <th className="border p-3">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {results.map((result) => (

                <tr key={result.id}>

                  <td className="border p-3">
                    {result.programme_id}
                  </td>

                  <td className="border p-3">
                    {result.category || "-"}
                  </td>

                  <td className="border p-3">
                    {result.programme_name}
                  </td>

                  <td className="border p-3 font-semibold">
                    {result.student_name}
                  </td>

                  <td className="border p-3">
                    {result.team}
                  </td>

                  <td className="border p-3 font-bold">
                    {result.position}
                  </td>

                  <td className="border p-3">
                    {result.points}
                  </td>

                  <td className="border p-3 text-xs">
                    {result.group_result_id || "-"}
                  </td>

                  <td className="border p-3">

                    <button
                      onClick={() =>
                        deleteResult(result.id)
                      }
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}