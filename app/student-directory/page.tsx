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

export default function StudentDirectoryPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const userData = localStorage.getItem("user");

    if (!userData) {
      window.location.href = "/login";
      return;
    }

    try {
      const user = JSON.parse(userData);

      if (user.role !== "admin") {
        alert("Access denied. Admin only.");
        window.location.href = "/teacher-dashboard";
        return;
      }

      setIsAdmin(true);
      loadData();
    } catch {
      window.location.href = "/login";
    }
  }

  async function loadData() {
    setLoading(true);

    try {
      // ==========================================
      // LOAD STUDENTS
      // ==========================================

      const studentsResponse = await supabase
        .from("students")
        .select(
          "id, admission_no, student_name, class, division, team, category, gender"
        )
        .order("class")
        .order("student_name");

      if (studentsResponse.error) {
        console.error(
          "Student loading error:",
          studentsResponse.error
        );

        alert(studentsResponse.error.message);
        setStudents([]);
        setLoading(false);
        return;
      }

      setStudents(studentsResponse.data || []);

      // ==========================================
      // LOAD ALL REGISTRATIONS
      // ==========================================

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
          console.error(
            "Registration loading error:",
            error
          );

          alert(error.message);
          setRegistrations([]);
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
        "Total registrations loaded:",
        allRegistrations.length
      );

      setRegistrations(allRegistrations);
    } catch (error) {
      console.error(
        "Student Directory loading error:",
        error
      );

      alert("Failed to load Student Directory data.");
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------
  // GET PROGRAMMES FOR A STUDENT
  // ------------------------------------------

  function getStudentProgrammes(
    admissionNo: string | null
  ) {
    if (!admissionNo) {
      return [];
    }

    const studentAdmissionNo = String(
      admissionNo
    ).trim();

    const programmes = registrations
      .filter((registration) => {
        const registrationAdmissionNo = String(
          registration.admission_no ?? ""
        ).trim();

        return (
          registrationAdmissionNo ===
          studentAdmissionNo
        );
      })
      .map(
        (registration) =>
          registration.programme_name
      )
      .filter(Boolean) as string[];

    return Array.from(
      new Set(programmes)
    );
  }

  // ------------------------------------------
  // UNIQUE CLASS LIST
  // ------------------------------------------

  const classes = useMemo(() => {
    return Array.from(
      new Set(
        students
          .map((student) => student.class)
          .filter(Boolean)
      )
    ).sort();
  }, [students]);

  // ------------------------------------------
  // UNIQUE TEAM LIST
  // ------------------------------------------

  const teams = useMemo(() => {
    return Array.from(
      new Set(
        students
          .map((student) => student.team)
          .filter(Boolean)
      )
    ).sort();
  }, [students]);

  // ------------------------------------------
  // UNIQUE DIVISION LIST
  // ------------------------------------------

  const divisions = useMemo(() => {
    return Array.from(
      new Set(
        students
          .map((student) => student.division)
          .filter(Boolean)
      )
    ).sort();
  }, [students]);

  // ------------------------------------------
  // UNIQUE CATEGORY LIST
  // ------------------------------------------

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        students
          .map((student) => student.category)
          .filter(Boolean)
      )
    ).sort();
  }, [students]);

  // ------------------------------------------
  // FILTER STUDENTS
  // ------------------------------------------

  const filteredStudents = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !searchText ||
        (student.student_name || "")
          .toLowerCase()
          .includes(searchText) ||
        (student.admission_no || "")
          .toLowerCase()
          .includes(searchText);

      const matchesClass =
        !classFilter ||
        student.class === classFilter;

      const matchesTeam =
        !teamFilter ||
        student.team === teamFilter;

      const matchesDivision =
        !divisionFilter ||
        student.division === divisionFilter;

      const matchesCategory =
        !categoryFilter ||
        student.category === categoryFilter;

      return (
        matchesSearch &&
        matchesClass &&
        matchesDivision &&
        matchesTeam &&
        matchesCategory
      );
    });
  }, [
    students,
    search,
    classFilter,
    divisionFilter,
    teamFilter,
    categoryFilter,
  ]);

  // ------------------------------------------
  // CLEAR FILTERS
  // ------------------------------------------

  function clearFilters() {
    setSearch("");
    setClassFilter("");
    setDivisionFilter("");
    setTeamFilter("");
    setCategoryFilter("");
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-2 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
              MUNAFASA 2026
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              👨‍🎓 Student Directory
            </h1>

            <p className="mt-2 text-slate-500">
              View students, teams and programme assignments
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/assigned-lists";
            }}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            📋 Assigned / Not Assigned Lists
          </button>

        </div>

        {/* SUMMARY */}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Students
            </p>

            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
              {students.length}
            </p>
          </div>

          {/* SHOWING */}

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm">
            <p className="text-sm font-medium text-indigo-600">
              Showing
            </p>

            <p className="mt-2 text-4xl font-bold tracking-tight text-indigo-700">
              {filteredStudents.length}
            </p>
          </div>

          {/* ASSIGNED */}

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
            <p className="text-sm font-medium text-emerald-600">
              Assigned
            </p>

            <p className="mt-2 text-4xl font-bold tracking-tight text-emerald-700">
              {
                students.filter(
                  (student) =>
                    getStudentProgrammes(
                      student.admission_no
                    ).length > 0
                ).length
              }
            </p>
          </div>

          {/* NOT ASSIGNED */}

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
            <p className="text-sm font-medium text-amber-600">
              Not Assigned
            </p>

            <p className="mt-2 text-4xl font-bold tracking-tight text-amber-700">
              {
                students.filter(
                  (student) =>
                    getStudentProgrammes(
                      student.admission_no
                    ).length === 0
                ).length
              }
            </p>
          </div>

        </div>

        {/* SEARCH + FILTERS */}

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              🔎 Search & Filter Students
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Find students by admission number, name, class, division, team or category.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

            {/* SEARCH */}

            <input
              type="text"
              placeholder="Admission No. or Student Name"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />

            {/* CLASS */}

            <select
              value={classFilter}
              onChange={(e) =>
                setClassFilter(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">
                All Classes
              </option>

              {classes.map((item) => (
                <option
                  key={item}
                  value={item ?? ""}
                >
                  {item ?? ""}
                </option>
              ))}
            </select>

            {/* DIVISION */}

            <select
              value={divisionFilter}
              onChange={(e) =>
                setDivisionFilter(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">
                All Divisions
              </option>

              {divisions.map((item) => (
                <option
                  key={item}
                  value={item ?? ""}
                >
                  {item ?? ""}
                </option>
              ))}
            </select>

            {/* TEAM */}

            <select
              value={teamFilter}
              onChange={(e) =>
                setTeamFilter(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">
                All Teams
              </option>

              {teams.map((item) => (
                <option
                  key={item}
                  value={item ?? ""}
                >
                  {item ?? ""}
                </option>
              ))}
            </select>

            {/* CATEGORY */}

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">
                All Categories
              </option>

              {categories.map((item) => (
                <option
                  key={item}
                  value={item ?? ""}
                >
                  {item ?? ""}
                </option>
              ))}
            </select>

          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl bg-slate-800 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-900"
            >
              ↺ Clear Filters
            </button>
          </div>

        </div>

        {/* PRINT / PDF REPORT */}

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                🖨️ Class & Division Report
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Print or save the currently filtered student list as PDF.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                🖨️ Print
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                📄 PDF
              </button>

            </div>

          </div>

        </div>

        {/* PRINT REPORT */}

        <div
          id="print-report"
          className="hidden print:block"
        >
          <div className="mb-6">
            <h1 className="text-center text-2xl font-bold">
              MUNAFASA 2026
            </h1>

            <h2 className="mt-2 text-center text-xl font-bold">
              Student Directory
            </h2>

            <p className="mt-2 text-center">
              {classFilter
                ? `Class: ${classFilter}`
                : "All Classes"}
              {"  "}
              {divisionFilter
                ? ` | Division: ${divisionFilter}`
                : " | All Divisions"}
            </p>

            <p className="mt-1 text-center">
              Total Students: {filteredStudents.length}
            </p>
          </div>

          <table className="w-full border-collapse border border-black text-sm">
            <thead>
              <tr>
                <th className="border border-black p-2">
                  #
                </th>

                <th className="border border-black p-2">
                  Admission No
                </th>

                <th className="border border-black p-2">
                  Student Name
                </th>

                <th className="border border-black p-2">
                  Class
                </th>

                <th className="border border-black p-2">
                  Division
                </th>

                <th className="border border-black p-2">
                  Team
                </th>

                <th className="border border-black p-2">
                  Category
                </th>

                <th className="border border-black p-2">
                  Gender
                </th>

                <th className="border border-black p-2">
                  Assigned Programme(s)
                </th>

                <th className="border border-black p-2">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map(
                (student, index) => {
                  const studentProgrammes =
                    getStudentProgrammes(
                      student.admission_no
                    );

                  const assigned =
                    studentProgrammes.length > 0;

                  return (
                    <tr
                      key={`print-${student.id}`}
                    >
                      <td className="border border-black p-2">
                        {index + 1}
                      </td>

                      <td className="border border-black p-2">
                        {student.admission_no || "-"}
                      </td>

                      <td className="border border-black p-2">
                        {student.student_name || "-"}
                      </td>

                      <td className="border border-black p-2">
                        {student.class || "-"}
                      </td>

                      <td className="border border-black p-2">
                        {student.division || "-"}
                      </td>

                      <td className="border border-black p-2">
                        {student.team || "-"}
                      </td>

                      <td className="border border-black p-2">
                        {student.category || "-"}
                      </td>

                      <td className="border border-black p-2">
                        {student.gender || "-"}
                      </td>

                      <td className="border border-black p-2">
                        {assigned
                          ? studentProgrammes.join(", ")
                          : "-"}
                      </td>

                      <td className="border border-black p-2 text-center">
                        {assigned
                          ? "Assigned"
                          : "Not Assigned"}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* STUDENT TABLE */}

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Student List
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredStudents.length} student(s) found
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
                {loading
                  ? "Loading..."
                  : `${filteredStudents.length} Records`}
              </div>

            </div>

          </div>

          {loading ? (

            <div className="p-12 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

              <p className="text-slate-500">
                Loading students...
              </p>
            </div>

          ) : filteredStudents.length === 0 ? (

            <div className="p-12 text-center">

              <div className="mb-3 text-4xl">
                🔍
              </div>

              <p className="font-semibold text-slate-700">
                No students found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
              </p>

            </div>

          ) : (

            <table className="w-full">

              <thead className="bg-slate-900 text-white">

                <tr>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    #
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Admission No
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Student Name
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Class
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Team
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Category
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Gender
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Assigned Programme(s)
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredStudents.map(
                  (student, index) => {

                    const studentProgrammes =
                      getStudentProgrammes(
                        student.admission_no
                      );

                    const assigned =
                      studentProgrammes.length > 0;

                    return (
                      <tr
                        key={student.id}
                        className="border-b border-slate-100 align-top transition hover:bg-slate-50"
                      >

                        <td className="p-4 text-slate-500">
                          {index + 1}
                        </td>

                        <td className="p-4 font-semibold text-slate-700">
                          {student.admission_no || "-"}
                        </td>

                        <td className="p-4 font-semibold text-slate-900">
                          {student.student_name || "-"}
                        </td>

                        <td className="p-4 text-slate-600">
                          {student.class || "-"}
                        </td>

                        <td className="p-4 font-semibold text-slate-700">
                          {student.team || "-"}
                        </td>

                        <td className="p-4 text-slate-600">
                          {student.category || "-"}
                        </td>

                        <td className="p-4 text-slate-600">
                          {student.gender || "-"}
                        </td>

                        {/* PROGRAMMES */}

                        <td className="p-4 align-top">

                          {assigned ? (

                            <div className="text-sm leading-6 text-slate-700">

                              {studentProgrammes.map(
                                (
                                  programme,
                                  programmeIndex
                                ) => (
                                  <span
                                    key={`${student.id}-${programme}-${programmeIndex}`}
                                  >
                                    {programme}

                                    {programmeIndex <
                                      studentProgrammes.length -
                                        1 && (
                                      <span className="mx-1 text-slate-300">
                                        •
                                      </span>
                                    )}
                                  </span>
                                )
                              )}

                            </div>

                          ) : (

                            <span className="text-slate-400">
                              —
                            </span>

                          )}

                        </td>

                        {/* STATUS */}

                        <td className="p-4 text-center">

                          {assigned ? (

                            <span className="inline-flex whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                              ✓ Assigned
                            </span>

                          ) : (

                            <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-500">
                              ○ Not Assigned
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

        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }

            #print-report,
            #print-report * {
              visibility: visible;
            }

            #print-report {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
              background: white;
            }

            @page {
              size: landscape;
              margin: 10mm;
            }
          }
        `}</style>

      </div>
    </DashboardLayout>
  );
}