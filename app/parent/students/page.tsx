"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Student {
  id: number;
  admission_no: string;
  student_name: string;
  class: string;
  house: string;
}

export default function MyStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("student_name");

    if (!error && data) {
      setStudents(data);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="bg-purple-800 text-white p-5">
        <h1 className="text-3xl font-bold">
          My Students
        </h1>
      </div>

      <div className="max-w-6xl mx-auto p-6">

        <table className="w-full bg-white shadow rounded-lg">

          <thead className="bg-gray-200">

            <tr>
              <th className="p-3 text-left">Admission</th>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-left">Class</th>
              <th className="p-3 text-left">House</th>
            </tr>

          </thead>

          <tbody>

            {students.map((student) => (

              <tr key={student.id} className="border-b">

                <td className="p-3">{student.admission_no}</td>
                <td className="p-3">{student.student_name}</td>
                <td className="p-3">{student.class}</td>
                <td className="p-3">{student.house}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}