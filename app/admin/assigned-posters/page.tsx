"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import BackButton from "../../components/layout/BackButton";
import { supabase } from "@/lib/supabase";

type Student = {
  id: number;
  admission_no: string | null;
  student_name: string | null;
  class: string | null;
  division: string | null;
  chest_no: string | null;
  team: string | null;
  category: string | null;
  gender: string | null;
};

type Registration = {
  id: number;
  admission_no: string | null;
  student_name: string | null;
  programme_id: number | null;
  programme_code: string | null;
  programme_name: string | null;
  programme_type: string | null;
  participant_type: string | null;
};

export default function AssignedPostersPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [studentsResponse, registrationsResponse] =
      await Promise.all([
        supabase
          .from("students")
          .select(
            "id, admission_no, student_name, class, division, chest_no, team, category, gender"
          )
          .order("student_name"),

        supabase
          .from("registrations")
          .select(
            "id, admission_no, student_name, programme_id, programme_code, programme_name, programme_type, participant_type"
          )
          .order("id", { ascending: false }),
      ]);

    if (studentsResponse.error) {
      console.error(
        "Student loading error:",
        studentsResponse.error
      );

      alert(studentsResponse.error.message);
      setStudents([]);
    } else {
      setStudents(
        (studentsResponse.data || []) as Student[]
      );
    }

    if (registrationsResponse.error) {
      console.error(
        "Registration loading error:",
        registrationsResponse.error
      );

      alert(registrationsResponse.error.message);
      setRegistrations([]);
    } else {
      setRegistrations(
        (registrationsResponse.data || []) as Registration[]
      );
    }

    setLoading(false);
  }

  // --------------------------------------------------
  // SEARCH STUDENTS
  // --------------------------------------------------

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return students;
    }

    return students.filter((student) => {
      const text = [
        student.admission_no,
        student.student_name,
        student.chest_no,
        student.class,
        student.team,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(term);
    });
  }, [students, search]);

  // --------------------------------------------------
  // GET STUDENT PROGRAMMES
  // --------------------------------------------------

  const studentProgrammes = useMemo(() => {
    if (!selectedStudent?.admission_no) {
      return [];
    }

    return registrations.filter(
      (registration) =>
        String(registration.admission_no).trim() ===
        String(selectedStudent.admission_no).trim()
    );
  }, [registrations, selectedStudent]);

  // --------------------------------------------------
  // PRINT POSTER
  // --------------------------------------------------

  function printPoster() {
    if (!selectedStudent) {
      alert("Please select a student first.");
      return;
    }

    if (studentProgrammes.length === 0) {
      alert("No programmes assigned to this student.");
      return;
    }

    window.print();
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl font-bold">
            Loading assigned programmes...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-100 p-6">

        {/* ADMIN SCREEN */}
        <div className="print:hidden">

          <BackButton />

          <div className="bg-green-950 text-white rounded-2xl p-6 mt-6 mb-6 shadow-lg">
            <h1 className="text-3xl font-bold">
              🎫 Assigned Programme Poster
            </h1>

            <p className="text-green-200 mt-2">
              Search a student and print their assigned programme poster.
            </p>
          </div>

          {/* SEARCH */}
          <div className="bg-white rounded-2xl shadow p-6 mb-6">

            <label className="block font-bold mb-2">
              Search Student
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Admission No / Chest No / Student Name"
              className="w-full border-2 border-gray-300 rounded-xl p-4"
            />

            {/* STUDENT LIST */}
            {search.trim() !== "" && (
              <div className="mt-4 border rounded-xl max-h-80 overflow-y-auto">

                {filteredStudents.length === 0 ? (
                  <div className="p-5 text-gray-500">
                    No student found.
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudent(student);
                        setSearch(
                          `${student.admission_no} - ${student.student_name}`
                        );
                      }}
                      className="w-full text-left p-4 border-b hover:bg-green-50"
                    >
                      <div className="font-bold">
                        {student.student_name}
                      </div>

                      <div className="text-sm text-gray-600">
                        Admission: {student.admission_no || "-"}
                        {" | "}
                        Chest: {student.chest_no || "-"}
                        {" | "}
                        Class: {student.class || "-"}
                        {" | "}
                        Team: {student.team || "-"}
                      </div>
                    </button>
                  ))
                )}

              </div>
            )}

          </div>

          {/* SELECTED STUDENT */}
          {selectedStudent && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">

              <h2 className="text-2xl font-bold mb-5">
                Student Details
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                <div>
                  <p className="text-gray-500 text-sm">
                    Student
                  </p>
                  <p className="font-bold">
                    {selectedStudent.student_name || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Admission No
                  </p>
                  <p className="font-bold">
                    {selectedStudent.admission_no || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Chest No
                  </p>
                  <p className="font-bold">
                    {selectedStudent.chest_no || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Class
                  </p>
                  <p className="font-bold">
                    {selectedStudent.class || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Category
                  </p>
                  <p className="font-bold">
                    {selectedStudent.category || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Team
                  </p>
                  <p className="font-bold">
                    {selectedStudent.team || "-"}
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* ASSIGNED PROGRAMMES */}
          {selectedStudent && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">

              <div className="flex justify-between items-center mb-5">

                <div>
                  <h2 className="text-2xl font-bold">
                    Assigned Programmes
                  </h2>

                  <p className="text-gray-500">
                    {studentProgrammes.length} programme(s) assigned
                  </p>
                </div>

                <button
                  type="button"
                  onClick={printPoster}
                  className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-xl font-bold"
                >
                  🖨 Print / Save PDF
                </button>

              </div>

              {studentProgrammes.length === 0 ? (
                <div className="border rounded-xl p-6 text-center text-gray-500">
                  No programmes assigned to this student.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">

                  {studentProgrammes.map((registration) => (
                    <div
                      key={registration.id}
                      className="border-2 border-green-200 bg-green-50 rounded-xl p-4"
                    >
                      <p className="font-bold text-green-800">
                        {registration.programme_name}
                      </p>

                      <p className="text-sm text-gray-600 mt-1">
                        Programme ID:{" "}
                        {registration.programme_id ?? "-"}
                      </p>

                      <p className="text-sm text-gray-600">
                        Type:{" "}
                        {registration.programme_type || "-"}
                      </p>
                    </div>
                  ))}

                </div>
              )}

            </div>
          )}

        </div>

        {/* ==================================================
            PRINT POSTER
        ================================================== */}

        {selectedStudent &&
          studentProgrammes.length > 0 && (

          <div className="hidden print:block">

            <div className="poster">

              {/* HEADER */}
              <div className="poster-header">

                <h1>
                  MUNAFASA 2026
                </h1>

                <h2>
                  THE GLOBAL PUBLIC SCHOOL
                </h2>

                <p>
                  PROGRAMME REGISTRATION
                </p>

                <p className="confirmation">
                  ASSIGNED PROGRAMMES
                </p>

              </div>

              {/* STUDENT */}
              <div className="student-box">

                <h3>
                  STUDENT DETAILS
                </h3>

                <div className="student-grid">

                  <div>
                    <strong>Student Name</strong>
                    <br />
                    {selectedStudent.student_name || "-"}
                  </div>

                  <div>
                    <strong>Admission No</strong>
                    <br />
                    {selectedStudent.admission_no || "-"}
                  </div>

                  <div>
                    <strong>Chest No</strong>
                    <br />
                    {selectedStudent.chest_no || "-"}
                  </div>

                  <div>
                    <strong>Class</strong>
                    <br />
                    {selectedStudent.class || "-"}
                  </div>

                  <div>
                    <strong>Category</strong>
                    <br />
                    {selectedStudent.category || "-"}
                  </div>

                  <div>
                    <strong>Team</strong>
                    <br />
                    {selectedStudent.team || "-"}
                  </div>

                </div>

              </div>

              {/* PROGRAMMES */}
              <div className="programme-box">

                <h3>
                  ASSIGNED PROGRAMMES
                </h3>

                <table>

                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Programme</th>
                      <th>Type</th>
                    </tr>
                  </thead>

                  <tbody>

                    {studentProgrammes.map(
                      (registration, index) => (
                        <tr key={registration.id}>

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <strong>
                              {registration.programme_name}
                            </strong>
                          </td>

                          <td>
                            {registration.programme_type || "-"}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

              <div className="poster-footer">
                MUNAFASA 2026 — THE GLOBAL PUBLIC SCHOOL
              </div>

            </div>

          </div>
        )}

        {/* PRINT STYLE */}
<style jsx global>{`
  @media print {
    @page {
      size: A4 portrait;
      margin: 8mm;
    }

    html,
    body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      height: auto !important;
      min-height: 0 !important;
      overflow: visible !important;
      font-family: Arial, Helvetica, sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    /* Hide everything except the poster */
    body * {
      visibility: hidden !important;
    }

    .poster,
    .poster * {
      visibility: visible !important;
    }

    .poster {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;

      width: 100% !important;
      max-width: none !important;

      margin: 0 !important;
      padding: 0 !important;

      background: white !important;
      color: #111 !important;

      page-break-after: avoid !important;
      break-after: avoid !important;

      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .poster-header {
      text-align: center;
      border-bottom: 2px solid #075c2d;

      padding-bottom: 7px;
      margin-bottom: 8px;
    }

    .poster-header h1 {
      font-size: 24px;
      line-height: 1.1;

      font-weight: 800;
      color: #075c2d;

      margin: 0;
    }

    .poster-header h2 {
      font-size: 15px;
      line-height: 1.1;

      margin: 4px 0 0;
      font-weight: 700;
    }

    .poster-header p {
      font-size: 13px;
      line-height: 1.1;

      margin: 4px 0 0;
      font-weight: 700;
    }

    .poster-header .confirmation {
      font-size: 11px;
      color: #555;
    }

    .student-box,
    .programme-box {
      border: 1px solid #333;

      padding: 8px;
      margin-bottom: 8px;

      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .student-box h3,
    .programme-box h3 {
      margin: 0 0 6px;

      font-size: 13px;
      line-height: 1.1;

      color: #075c2d;
    }

    .student-grid {
      display: grid;

      grid-template-columns: repeat(3, 1fr);

      gap: 7px;

      font-size: 10px;
      line-height: 1.15;
    }

    .student-grid strong {
      font-size: 8px;
      color: #666;
    }

    table {
      width: 100% !important;

      border-collapse: collapse;

      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    thead {
      display: table-header-group;
    }

    tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    th {
      background: #075c2d !important;
      color: white !important;

      padding: 5px;

      border: 1px solid #333;

      font-size: 9px;
      line-height: 1.1;

      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    td {
      padding: 5px;

      border: 1px solid #333;

      font-size: 9px;
      line-height: 1.1;

      vertical-align: middle;
    }

    td:first-child {
      text-align: center;
      width: 8%;
    }

    .poster-footer {
      text-align: right;

      margin-top: 8px;

      font-size: 8px;
      font-weight: 600;

      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Prevent the print wrapper from creating another page */
    .hidden.print\\:block {
      display: block !important;

      width: 100% !important;

      margin: 0 !important;
      padding: 0 !important;

      height: auto !important;
      min-height: 0 !important;

      page-break-after: avoid !important;
      break-after: avoid !important;
    }

    /* Remove page spacing caused by DashboardLayout */
    main,
    #__next {
      margin: 0 !important;
      padding: 0 !important;
      min-height: 0 !important;
      height: auto !important;
    }
  }
`}</style>

      </div>
    </DashboardLayout>
  );
}