"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TeacherAssignmentPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  const [teacherId, setTeacherId] = useState("");
  const [programmeId, setProgrammeId] = useState("");

  useEffect(() => {
    loadTeachers();
    loadProgrammes();
    loadAssignments();
  }, []);

  async function loadTeachers() {
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("teacher_name");

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setTeachers(data || []);
  }

  async function loadProgrammes() {
    const { data, error } = await supabase
      .from("programmes")
      .select("*")
      .order("programme_name");

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setProgrammes(data || []);
  }

  async function loadAssignments() {
    const { data, error } = await supabase
      .from("teacher_programmes")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setAssignments(data || []);
  }

  async function assignProgramme() {
    if (!teacherId) {
      alert("Select a teacher");
      return;
    }

    if (!programmeId) {
      alert("Select a programme");
      return;
    }

    const { error } = await supabase
      .from("teacher_programmes")
      .insert({
        teacher_id: Number(teacherId),
        programme_id: Number(programmeId),
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Programme Assigned Successfully!");

    setTeacherId("");
    setProgrammeId("");

    loadAssignments();
  }

  async function deleteAssignment(id: number) {
    const ok = confirm("Delete this assignment?");

    if (!ok) return;

    const { error } = await supabase
      .from("teacher_programmes")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadAssignments();
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        👨‍🏫 Teacher Programme Assignment
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-4">

          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="border rounded p-3"
          >
            <option value="">Select Teacher</option>

            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.teacher_name}
              </option>
            ))}
          </select>

          <select
            value={programmeId}
            onChange={(e) => setProgrammeId(e.target.value)}
            className="border rounded p-3"
          >
            <option value="">Select Programme</option>

            {programmes.map((programme) => (
              <option key={programme.id} value={programme.id}>
                {programme.programme_name}
              </option>
            ))}
          </select>

        </div>

        <button
          type="button"
          onClick={assignProgramme}
          className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded"
        >
          ➕ Assign Programme
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6">

        <h2 className="text-2xl font-bold mb-5">
          Assigned Programmes
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border">

            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Teacher ID</th>
                <th className="border p-2">Programme ID</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id}>

                  <td className="border p-2">
                    {assignment.teacher_id}
                  </td>

                  <td className="border p-2">
                    {assignment.programme_id}
                  </td>

                  <td className="border p-2 text-center">
                    <button
                      type="button"
                      onClick={() => deleteAssignment(assignment.id)}
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