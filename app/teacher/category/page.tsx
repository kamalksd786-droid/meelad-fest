"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Student {
  id: number;
  admission_no: string;
  student_name: string;
  class: string;
  house: string;
  category: string;
}

export default function CategoryStudentsPage() {
  const params = useParams();
  const category = decodeURIComponent(params.category as string);

  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, [category]);

  useEffect(() => {
    const result = students.filter(
      (student) =>
        student.student_name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        student.admission_no
          .toLowerCase()
          .includes(search.toLowerCase())
    );

    setFiltered(result);
  }, [search, students]);

  async function loadStudents() {
    setLoading(true);

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("category", category)
      .order("student_name");

    if (!error && data) {
      setStudents(data);
      setFiltered(data);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}

      <div className="bg-purple-800 text-white p-6">

        <h1 className="text-3xl font-bold">
          {category}
        </h1>

        <p className="text-purple-200">
          Student List
        </p>

      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* Search */}

        <input
          type="text"
          placeholder="Search by Admission No or Student Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 border rounded-lg p-3 mb-6"
        />

        {/* Table */}

        <div className="bg-white rounded-xl shadow overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-200">

              <tr>

                <th className="p-3 text-left">
                  Admission
                </th>

                <th className="p-3 text-left">
                  Student
                </th>

                <th className="p-3 text-left">
                  Class
                </th>

                <th className="p-3 text-left">
                  House
                </th>

                <th className="p-3 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={5}
                    className="text-center p-10"
                  >
                    Loading Students...
                  </td>

                </tr>

              ) : filtered.length === 0 ? (

                <tr>

                  <td
                    colSpan={5}
                    className="text-center p-10"
                  >
                    No students found.
                  </td>

                </tr>

              ) : (

                filtered.map((student) => (

                  <tr
                    key={student.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="p-3">
                      {student.admission_no}
                    </td>

                    <td className="p-3 font-medium">
                      {student.student_name}
                    </td>

                    <td className="p-3">
                      {student.class}
                    </td>

                    <td className="p-3">
                      {student.house}
                    </td>

                    <td className="p-3 text-center">

                      <Link
                        href={`/teacher/students/${student.id}`}
                        className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg"
                      >
                        Assign Programmes
                      </Link>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}