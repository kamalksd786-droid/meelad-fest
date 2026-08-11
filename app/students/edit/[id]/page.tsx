"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { supabase } from "../../../../lib/supabase";

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [admissionNo, setAdmissionNo] = useState("");
  const [studentName, setStudentName] = useState("");
  const [category, setCategory] = useState("");
  const [team, setTeam] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudent();
  }, []);

  async function loadStudent() {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setAdmissionNo(data.admission_no);
    setStudentName(data.student_name);
    setCategory(data.category);
    setTeam(data.team);

    setLoading(false);
  }

  async function updateStudent(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase
      .from("students")
      .update({
        admission_no: admissionNo,
        student_name: studentName,
        category,
        team,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Student updated successfully!");

    router.push("/students");
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-green-950 text-white flex items-center justify-center">
          Loading...
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-green-950 text-white p-10">

        <div className="max-w-xl mx-auto bg-green-900 rounded-xl p-8">

          <h1 className="text-4xl font-bold mb-8">
            ✏️ Edit Student
          </h1>

          <form onSubmit={updateStudent} className="space-y-5">

            <input
              type="text"
              placeholder="Admission No"
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value)}
              className="w-full p-3 rounded text-black"
              required
            />

            <input
              type="text"
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full p-3 rounded text-black"
              required
            />

            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded text-black"
              required
            />

            <input
              type="text"
              placeholder="Team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full p-3 rounded text-black"
              required
            />

            <button
              type="submit"
              className="w-full bg-yellow-500 text-black py-3 rounded-lg font-bold"
            >
              Update Student
            </button>

          </form>

        </div>

      </main>
    </>
  );
}