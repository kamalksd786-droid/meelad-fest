"use client";

import DashboardLayout from "../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProgrammeSection from "../teacher/register/ProgrammeSection";

export default function TeacherRegistrationPage() {
  const [teacherId, setTeacherId] = useState("");

  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    const id = localStorage.getItem("teacherId");

    if (!id) {
      window.location.href = "/teacher-login";
      return;
    }

    setTeacherId(id);
  }, []);

  async function searchStudents(value: string) {
    setSearch(value);

    if (value.trim().length < 1) {
      setStudents([]);
      return;
    }

    const searchValue = value.trim();

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .or(
        `student_name.ilike.%${searchValue}%,admission_no.ilike.%${searchValue}%,chest_no.ilike.%${searchValue}%`
      )
      .order("student_name")
      .limit(20);

    if (error) {
      console.error("Student search error:", error);
      setStudents([]);
      return;
    }

    setStudents(data || []);
  }

  function selectStudent(student: any) {
    setSelectedStudent(student);
    setStudents([]);
    setSearch(student.student_name || "");
  }

  function clearStudent() {
    setSelectedStudent(null);
    setStudents([]);
    setSearch("");
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          👨‍🏫 Student Registration
        </h1>

        {/* SEARCH */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <label className="font-semibold block mb-2">
            Search Student
          </label>

          <input
            type="text"
            value={search}
            onChange={(e) => searchStudents(e.target.value)}
            placeholder="Search Name / Admission / Chest No"
            className="w-full border rounded-lg p-3"
          />

          {students.length > 0 && (
            <div className="mt-3 border rounded-lg overflow-hidden">

              {students.map((student: any) => (
                <button
                  type="button"
                  key={student.id}
                  onClick={() => selectStudent(student)}
                  className="w-full text-left border-b p-4 hover:bg-green-50"
                >
                  <div className="font-bold">
                    {student.student_name}
                  </div>

                  <div className="text-sm text-gray-600 mt-1">
                    Admission: {student.admission_no}
                    {" | "}
                    Chest: {student.chest_no}
                    {" | "}
                    Category: {student.category}
                    {" | "}
                    Gender: {student.gender}
                  </div>
                </button>
              ))}

            </div>
          )}

        </div>

        {/* STUDENT DETAILS */}

        {selectedStudent && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-xl font-bold">
                Student Details
              </h2>

              <button
                type="button"
                onClick={clearStudent}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Change Student
              </button>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <div>
                <p className="text-sm text-gray-500">
                  Student Name
                </p>
                <p className="font-bold">
                  {selectedStudent.student_name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Admission No
                </p>
                <p className="font-bold">
                  {selectedStudent.admission_no}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Chest No
                </p>
                <p className="font-bold">
                  {selectedStudent.chest_no}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Category
                </p>
                <p className="font-bold">
                  {selectedStudent.category}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Gender
                </p>
                <p className="font-bold">
                  {selectedStudent.gender}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Team
                </p>
                <p className="font-bold">
                  {selectedStudent.team}
                </p>
              </div>

            </div>

          </div>
        )}

        {/* PROGRAMMES */}

        {selectedStudent && teacherId && (
          <ProgrammeSection
            student={selectedStudent}
            teacherId={teacherId}
            onRegistered={() => {
              console.log("Registration completed");
            }}
          />
        )}

      </div>
    </DashboardLayout>
  );
}