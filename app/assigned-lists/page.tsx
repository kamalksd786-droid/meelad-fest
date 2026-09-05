"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";

type Student = {
  id: number;
  admission_no: string | null;
  student_name: string | null;
  class: string | null;
  division: string | null;
  team: string | null;
  category: string | null;
  gender: string | null;
};

type Registration = {
  id: number;
  admission_no: string | null;
  programme_name: string | null;
};

type ReportType = "assigned" | "not-assigned";

export default function AssignedListsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const [teamFilter, setTeamFilter] = useState("");
const [classFilter, setClassFilter] = useState("");
const [divisionFilter, setDivisionFilter] = useState("");

  const [reportType, setReportType] =
    useState<ReportType>("assigned");

  const [showReport, setShowReport] = useState(false);

  const [isAuthorized, setIsAuthorized] = useState(false);

 useEffect(() => {
  checkAccess();
}, []);

async function checkAccess() {
  const userData = localStorage.getItem("user");

  if (!userData) {
    window.location.href = "/login";
    return;
  }

  try {
    const user = JSON.parse(userData);

    if (user.role !== "admin" && user.role !== "teacher") {
      alert("Access denied.");
      window.location.href = "/login";
      return;
    }

    setIsAuthorized(true);
    loadData();
  } catch {
    window.location.href = "/login";
  }
}

  async function loadData() {
    setLoading(true);

    try {
      // -----------------------------
      // LOAD STUDENTS
      // -----------------------------

      const { data: studentData, error: studentError } =
        await supabase
          .from("students")
          .select(
            "id, admission_no, student_name, class, division, team, category, gender"
          )
          .order("class")
          .order("division")
          .order("student_name");

      if (studentError) {
        console.error(studentError);
        alert(studentError.message);
        setLoading(false);
        return;
      }

      setStudents(studentData || []);

      // -----------------------------
      // LOAD ALL REGISTRATIONS
      // -----------------------------

      const allRegistrations: Registration[] = [];

      const batchSize = 1000;
      let from = 0;

      while (true) {
        const { data, error } = await supabase
          .from("registrations")
          .select("id, admission_no, programme_name")
          .order("id", { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) {
          console.error(error);
          alert(error.message);
          break;
        }

        if (!data || data.length === 0) {
          break;
        }

        allRegistrations.push(
          ...(data as Registration[])
        );

        if (data.length < batchSize) {
          break;
        }

        from += batchSize;
      }

      console.log(
        "Total registrations:",
        allRegistrations.length
      );

      setRegistrations(allRegistrations);
    } catch (error) {
      console.error(error);
      alert("Failed to load assigned list.");
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------
  // PROGRAMMES FOR STUDENT
  // -----------------------------

  function getStudentProgrammes(
    admissionNo: string | null
  ): string[] {
    if (!admissionNo) return [];

    const target = String(admissionNo).trim();

    const programmes = registrations
      .filter(
        (registration) =>
          String(
            registration.admission_no ?? ""
          ).trim() === target
      )
      .map(
        (registration) =>
          registration.programme_name
      )
      .filter(Boolean) as string[];

    return Array.from(new Set(programmes));
  }
// -----------------------------
// TEAM LIST
// -----------------------------

const teams = useMemo(() => {
  return Array.from(
    new Set(
      students
        .map((student) => student.team)
        .filter(Boolean)
    )
  ).sort();
}, [students]);
  // -----------------------------
  // CLASS LIST
  // -----------------------------
const classes = useMemo(() => {
  return Array.from(
    new Set(
      students
        .filter(
          (student) =>
            !teamFilter ||
            student.team === teamFilter
        )
        .map((student) => student.class)
        .filter(Boolean)
    )
  ).sort();
}, [students, teamFilter]);

  // -----------------------------
  // DIVISION LIST
  // -----------------------------

  const divisions = useMemo(() => {
  const filteredStudents = students.filter(
    (student) =>
      (!teamFilter || student.team === teamFilter) &&
      (!classFilter || student.class === classFilter)
  );

  return Array.from(
    new Set(
      filteredStudents
        .map((student) => student.division)
        .filter(Boolean)
    )
  ).sort();
}, [students, teamFilter, classFilter]);
  // -----------------------------
  // REPORT STUDENTS
  // -----------------------------

 const reportStudents = useMemo(() => {
  return students
    .filter((student) => {
      const matchesTeam =
        !teamFilter ||
        student.team === teamFilter;

      const matchesClass =
        !classFilter ||
        student.class === classFilter;

      const matchesDivision =
        !divisionFilter ||
        student.division === divisionFilter;

      return (
        matchesTeam &&
        matchesClass &&
        matchesDivision
      );
    })
    .filter((student) => {
      const assigned =
        getStudentProgrammes(
          student.admission_no
        ).length > 0;

      return reportType === "assigned"
        ? assigned
        : !assigned;
    });
}, [
  students,
  registrations,
  teamFilter,
  classFilter,
  divisionFilter,
  reportType,
]);

  // -----------------------------
  // REPORT TITLE
  // -----------------------------

  const reportTitle =
    reportType === "assigned"
      ? "ASSIGNED STUDENT LIST"
      : "NOT ASSIGNED STUDENT LIST";

  // -----------------------------
  // PRINT / PDF
  // -----------------------------

  function printReport() {
    const printWindow = window.open(
      "",
      "_blank",
      "width=1200,height=800"
    );

    if (!printWindow) {
      alert(
        "Please allow pop-ups for this website."
      );
      return;
    }

    const rows = reportStudents
      .map((student, index) => {
        const programmes =
          getStudentProgrammes(
            student.admission_no
          );

        return `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(
              student.admission_no || "-"
            )}</td>
            <td>${escapeHtml(
              student.student_name || "-"
            )}</td>
            <td>${escapeHtml(
              student.class || "-"
            )}</td>
            <td>${escapeHtml(
              student.division || "-"
            )}</td>
            <td>${escapeHtml(
              student.team || "-"
            )}</td>
            <td>${escapeHtml(
              student.category || "-"
            )}</td>
            <td>${escapeHtml(
              student.gender || "-"
            )}</td>
            <td>
              ${
                reportType === "assigned"
                  ? programmes
                      .map(
                        (p) =>
                          `<div>• ${escapeHtml(
                            p
                          )}</div>`
                      )
                      .join("")
                  : `<strong>NOT ASSIGNED</strong>`
              }
            </td>
          </tr>
        `;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>

      <head>

        <title>
          ${reportTitle}
        </title>

        <style>

          @page {
            size: A4 landscape;
            margin: 12mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            font-family:
              Arial,
              Helvetica,
              sans-serif;

            margin: 0;
            color: #111827;
          }

          .header {
            text-align: center;
            border-bottom:
              3px solid #14532d;

            padding-bottom: 12px;
            margin-bottom: 15px;
          }

          .school {
            font-size: 23px;
            font-weight: 800;
            color: #14532d;
          }

          .event {
            font-size: 17px;
            font-weight: 700;
            margin-top: 4px;
          }

          .title {
            font-size: 20px;
            font-weight: 800;
            margin-top: 10px;
          }

          .selection {
            margin-top: 8px;
            font-size: 13px;
          }

          .count {
            text-align: center;
            font-weight: bold;
            margin-bottom: 12px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }

          th {
            background: #14532d;
            color: white;
            border: 1px solid #0f3d22;
            padding: 7px 5px;
            text-align: left;
          }

          td {
            border: 1px solid #d1d5db;
            padding: 6px 5px;
            vertical-align: top;
          }

          tr:nth-child(even) td {
            background: #f9fafb;
          }

          .footer {
            margin-top: 15px;
            text-align: right;
            font-size: 9px;
            color: #6b7280;
          }

        </style>

      </head>

      <body>

        <div class="header">

          <div class="school">
            GLOBAL PUBLIC SCHOOL
          </div>

          <div class="event">
            MUNAFASA 2026
          </div>

          <div class="title">
            ${reportTitle}
          </div>

         <div class="selection">

  <strong>Team:</strong>
  ${escapeHtml(
    teamFilter || "All Teams"
  )}

  &nbsp;&nbsp;&nbsp;

  <strong>Class:</strong>
  ${escapeHtml(
    classFilter || "All Classes"
  )}

  &nbsp;&nbsp;&nbsp;

  <strong>Division:</strong>
  ${escapeHtml(
    divisionFilter || "All Divisions"
  )}

</div>

        <div class="count">
          Total Students:
          ${reportStudents.length}
        </div>

        <table>

          <thead>

            <tr>

              <th>No.</th>

              <th>
                Admission No.
              </th>

              <th>
                Student Name
              </th>

              <th>
                Class
              </th>

              <th>
                Division
              </th>

              <th>
                Team
              </th>

              <th>
                Category
              </th>

              <th>
                Gender
              </th>

              <th>
                ${
                  reportType === "assigned"
                    ? "Assigned Programme(s)"
                    : "Status"
                }
              </th>

            </tr>

          </thead>

          <tbody>

            ${
              rows ||
              `
                <tr>
                  <td
                    colspan="9"
                    style="
                      text-align:center;
                      padding:20px;
                    "
                  >
                    No students found.
                  </td>
                </tr>
              `
            }

          </tbody>

        </table>

        <div class="footer">
          Generated:
          ${escapeHtml(
            new Date().toLocaleString()
          )}
        </div>

      </body>

      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  function escapeHtml(value: string) {
    return value
      .replace(/&/g, "&amp;")
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <DashboardLayout>

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          📋 Assigned / Not Assigned Lists
        </h1>

        <p className="text-gray-500 mt-2">
          View and print student programme
          assignment reports by class and division.
        </p>

      </div>

      {/* FILTER */}

<div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

  <h2 className="text-xl font-bold mb-5">
    🔎 Select Team, Class & Division
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

    {/* TEAM */}

    <div>

      <label className="block font-semibold mb-2">
        Team
      </label>

      <select
        value={teamFilter}
        onChange={(e) => {
          setTeamFilter(e.target.value);
          setClassFilter("");
          setDivisionFilter("");
        }}
        className="w-full border rounded-lg p-3"
      >

        <option value="">
          All Teams
        </option>

        {teams.map((item) => (
          <option
            key={item}
            value={item || ""}
          >
            {item}
          </option>
        ))}

      </select>

    </div>

    {/* CLASS */}

    <div>

      <label className="block font-semibold mb-2">
        Class
      </label>

      <select
        value={classFilter}
        onChange={(e) => {
          setClassFilter(e.target.value);
          setDivisionFilter("");
        }}
        className="w-full border rounded-lg p-3"
      >

        <option value="">
          All Classes
        </option>

        {classes.map((item) => (
          <option
            key={item}
            value={item || ""}
          >
            Class {item}
          </option>
        ))}

      </select>

    </div>

    {/* DIVISION */}

    <div>

      <label className="block font-semibold mb-2">
        Division
      </label>

      <select
        value={divisionFilter}
        onChange={(e) =>
          setDivisionFilter(e.target.value)
        }
        className="w-full border rounded-lg p-3"
      >

        <option value="">
          All Divisions
        </option>

        {divisions.map((item) => (
          <option
            key={item}
            value={item || ""}
          >
            Division {item}
          </option>
        ))}

      </select>

    </div>

  </div>

</div>

      {/* REPORT TYPE */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

        <button
          type="button"
          onClick={() => {
            setReportType("assigned");
            setShowReport(true);
          }}
          className="bg-green-700 hover:bg-green-800 text-white rounded-2xl p-6 shadow-lg"
        >

          <div className="text-3xl mb-2">
            🟢
          </div>

          <div className="text-2xl font-bold">
            Assigned List
          </div>

          <div className="mt-2 text-green-100">
            View students with assigned
            programmes
          </div>

        </button>

        <button
          type="button"
          onClick={() => {
            setReportType("not-assigned");
            setShowReport(true);
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl p-6 shadow-lg"
        >

          <div className="text-3xl mb-2">
            🟠
          </div>

          <div className="text-2xl font-bold">
            Not Assigned List
          </div>

          <div className="mt-2 text-orange-100">
            View students without assigned
            programmes
          </div>

        </button>

      </div>

      {/* QUICK COUNT */}

      <div className="bg-white rounded-2xl shadow-lg p-6">

        <h2 className="text-xl font-bold mb-4">
          Report Summary
        </h2>

        {loading ? (

          <p className="text-gray-500">
            Loading...
          </p>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="bg-gray-100 rounded-xl p-5">

              <p className="text-gray-500">
                Selected Students
              </p>

              <p className="text-3xl font-bold mt-1">
                {
                  students.filter(
  (student) =>
    (!teamFilter ||
      student.team === teamFilter) &&
    (!classFilter ||
      student.class === classFilter) &&
    (!divisionFilter ||
      student.division === divisionFilter)
).length
                }
              </p>

            </div>

            <div className="bg-green-100 rounded-xl p-5">

              <p className="text-green-700">
                Assigned
              </p>

              <p className="text-3xl font-bold text-green-800 mt-1">
                {
                 students.filter(
  (student) =>
    (!teamFilter ||
      student.team === teamFilter) &&
    (!classFilter ||
      student.class === classFilter) &&
    (!divisionFilter ||
      student.division === divisionFilter) &&
    getStudentProgrammes(
      student.admission_no
    ).length > 0
).length
                }
              </p>

            </div>

            <div className="bg-orange-100 rounded-xl p-5">

              <p className="text-orange-700">
                Not Assigned
              </p>

              <p className="text-3xl font-bold text-orange-800 mt-1">
                {
                 students.filter(
  (student) =>
    (!teamFilter ||
      student.team === teamFilter) &&
    (!classFilter ||
      student.class === classFilter) &&
    (!divisionFilter ||
      student.division === divisionFilter) &&
    getStudentProgrammes(
      student.admission_no
    ).length === 0
).length
                }
              </p>

            </div>

          </div>

        )}

      </div>

      {/* REPORT MODAL */}

      {showReport && (

        <div className="fixed inset-0 z-50 bg-black/60 p-4 md:p-8 overflow-y-auto">

          <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* MODAL HEADER */}

            <div className="bg-green-900 text-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>

                <h2 className="text-2xl font-bold">
                  {reportTitle}
                </h2>

                <p className="text-green-100 mt-1">
  Team:{" "}
  {teamFilter || "All"}
  {" | "}
  Class:{" "}
  {classFilter || "All"}
  {" | "}
  Division:{" "}
  {divisionFilter || "All"}
  {" | "}
  Total:{" "}
  {reportStudents.length}
</p>

              </div>

              <div className="flex gap-2 flex-wrap">

                <button
                  type="button"
                  onClick={printReport}
                  className="bg-white text-green-900 px-4 py-2 rounded-lg font-bold hover:bg-gray-100"
                >
                  🖨️ Print / Save PDF
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowReport(false)
                  }
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700"
                >
                  ✕ Close
                </button>

              </div>

            </div>

            {/* REPORT */}

            <div className="p-6 overflow-x-auto">

              <div className="text-center border-b pb-5 mb-5">

                <h3 className="text-2xl font-extrabold text-green-900">
                  GLOBAL PUBLIC SCHOOL
                </h3>

                <p className="font-bold text-lg">
                  MUNAFASA 2026
                </p>

                <p className="font-bold mt-2">
                  {reportTitle}
                </p>

                <p className="text-sm text-gray-500 mt-1">
  Team:{" "}
  {teamFilter ||
    "All Teams"}
  {" | "}
  Class:{" "}
  {classFilter ||
    "All Classes"}
  {" | "}
  Division:{" "}
  {divisionFilter ||
    "All Divisions"}
</p>

              </div>

              {reportStudents.length === 0 ? (

                <div className="py-12 text-center text-gray-500">
                  No students found.
                </div>

              ) : (

                <table className="w-full border-collapse text-sm">

                  <thead>

                    <tr className="bg-green-900 text-white">

                      <th className="border p-3 text-left">
                        No.
                      </th>

                      <th className="border p-3 text-left">
                        Admission No.
                      </th>

                      <th className="border p-3 text-left">
                        Student Name
                      </th>

                      <th className="border p-3 text-left">
                        Class
                      </th>

                      <th className="border p-3 text-left">
                        Division
                      </th>

                      <th className="border p-3 text-left">
                        Team
                      </th>

                      <th className="border p-3 text-left">
                        Category
                      </th>

                      <th className="border p-3 text-left">
                        Gender
                      </th>

                      <th className="border p-3 text-left">
                        {
                          reportType ===
                          "assigned"
                            ? "Assigned Programme(s)"
                            : "Status"
                        }
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {reportStudents.map(
                      (student, index) => {

                        const programmes =
                          getStudentProgrammes(
                            student.admission_no
                          );

                        return (

                          <tr
                            key={student.id}
                            className="border-b align-top"
                          >

                            <td className="border p-3">
                              {index + 1}
                            </td>

                            <td className="border p-3 font-semibold">
                              {student.admission_no ||
                                "-"}
                            </td>

                            <td className="border p-3 font-semibold">
                              {student.student_name ||
                                "-"}
                            </td>

                            <td className="border p-3">
                              {student.class ||
                                "-"}
                            </td>

                            <td className="border p-3">
                              {student.division ||
                                "-"}
                            </td>

                            <td className="border p-3 font-bold">
                              {student.team ||
                                "-"}
                            </td>

                            <td className="border p-3">
                              {student.category ||
                                "-"}
                            </td>

                            <td className="border p-3">
                              {student.gender ||
                                "-"}
                            </td>

                            <td className="border p-3">

                              {reportType ===
                              "assigned" ? (

                                <div className="leading-6">

                                  {programmes.map(
                                    (
                                      programme,
                                      programmeIndex
                                    ) => (

                                      <div
                                        key={`${student.id}-${programme}-${programmeIndex}`}
                                      >
                                        •{" "}
                                        {programme}
                                      </div>

                                    )
                                  )}

                                </div>

                              ) : (

                                <span className="font-bold text-orange-600">
                                  ⚪ NOT ASSIGNED
                                </span>

                              )}

                            </td>

                          </tr>

                        );
                      }
                    )}

                  </tbody>

                </table>

              )}

            </div>

          </div>

        </div>

      )}

    </DashboardLayout>
  );
}