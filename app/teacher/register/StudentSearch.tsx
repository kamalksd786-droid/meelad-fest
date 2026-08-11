"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  onStudentFound: (student: any) => void;
}

export default function StudentSearch({ onStudentFound }: Props) {

  const [search, setSearch] = useState("");
  const [student, setStudent] = useState<any>(null);

  async function searchStudent(value: string) {

    setSearch(value);

    if (!value) {
      setStudent(null);
      onStudentFound(null);
      return;
    }

    const { data } = await supabase
      .from("students")
      .select("*")
      .or(`admission_no.eq.${value},chest_no.eq.${value}`)
      .maybeSingle();

    if (!data) {
      setStudent(null);
      onStudentFound(null);
      return;
    }

    setStudent(data);
    onStudentFound(data);

  }

  return (

    <div className="bg-white rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-5">
        🔍 Search Student
      </h2>

      <input
        className="border rounded-lg p-3 w-full"
        placeholder="Admission No / Chest No"
        value={search}
        onChange={(e) => searchStudent(e.target.value)}
      />

      {student && (

        <div className="mt-6 bg-gray-100 rounded-lg p-5">

          <p><b>Name :</b> {student.student_name}</p>

          <p><b>Admission :</b> {student.admission_no}</p>

          <p><b>Chest :</b> {student.chest_no}</p>

          <p><b>Category :</b> {student.category}</p>

          <p><b>Team :</b> {student.team}</p>

        </div>

      )}

    </div>

  );

}