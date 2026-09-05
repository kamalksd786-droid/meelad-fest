"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";

type Student = {
  id: number;
  admission_no: string | null;
  student_name: string | null;
  class: string | null;
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
        "id, admission_no, student_name, class, team, category, gender"
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
        .select(
          "id, admission_no, programme_name"
        )
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
      const registrationAdmissionNo =
        String(
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

      const matchesCategory =
        !categoryFilter ||
        student.category === categoryFilter;

      return (
        matchesSearch &&
        matchesClass &&
        matchesTeam &&
        matchesCategory
      );
    });
  }, [
    students,
    search,
    classFilter,
    teamFilter,
    categoryFilter,
  ]);

  // ------------------------------------------
  // CLEAR FILTERS
  // ------------------------------------------

  function clearFilters() {
    setSearch("");
    setClassFilter("");
    setTeamFilter("");
    setCategoryFilter("");
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout>

      {/* HEADER */}

     {/* HEADER */}

<div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

  <div>
    <h1 className="text-4xl font-bold">
      👨‍🎓 Student Directory
    </h1>

    <p className="text-gray-500 mt-2">
      View students, teams and programme assignments
    </p>
  </div>

  <button
    type="button"
    onClick={() => {
      window.location.href = "/assigned-lists";
    }}
    className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
  >
    📋 Assigned / Not Assigned Lists
  </button>

</div>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

        <div className="bg-green-800 text-white rounded-2xl p-6 shadow">

          <p className="text-green-100">
            Total Students
          </p>

          <p className="text-4xl font-bold mt-2">
            {students.length}
          </p>

        </div>

        <div className="bg-blue-700 text-white rounded-2xl p-6 shadow">

          <p className="text-blue-100">
            Showing
          </p>

          <p className="text-4xl font-bold mt-2">
            {filteredStudents.length}
          </p>

        </div>

        <div className="bg-purple-700 text-white rounded-2xl p-6 shadow">

          <p className="text-purple-100">
            Assigned
          </p>

          <p className="text-4xl font-bold mt-2">
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

        <div className="bg-orange-600 text-white rounded-2xl p-6 shadow">

          <p className="text-orange-100">
            Not Assigned
          </p>

          <p className="text-4xl font-bold mt-2">
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

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

        <h2 className="text-xl font-bold mb-5">
          🔎 Search & Filter Students
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* SEARCH */}

          <input
            type="text"
            placeholder="Admission No. or Student Name"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border rounded-lg p-3"
          />

          {/* CLASS */}

          <select
            value={classFilter}
            onChange={(e) =>
              setClassFilter(e.target.value)
            }
            className="border rounded-lg p-3"
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

          {/* TEAM */}

          <select
            value={teamFilter}
            onChange={(e) =>
              setTeamFilter(e.target.value)
            }
            className="border rounded-lg p-3"
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
            className="border rounded-lg p-3"
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
            className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg font-semibold"
          >
            ↺ Clear Filters
          </button>

        </div>

      </div>

      {/* STUDENT TABLE */}

      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">

        <div className="p-6 border-b">

          <h2 className="text-2xl font-bold">
            Student List
          </h2>

          <p className="text-gray-500 mt-1">
            {filteredStudents.length} student(s)
            found
          </p>

        </div>

        {loading ? (

          <div className="p-8 text-center text-gray-500">
            Loading students...
          </div>

        ) : filteredStudents.length === 0 ? (

          <div className="p-8 text-center text-gray-500">
            No students found.
          </div>

        ) : (

          <table className="w-full">

            <thead className="bg-green-900 text-white">

              <tr>

                <th className="p-4 text-left">
                  #
                </th>

                <th className="p-4 text-left">
                  Admission No
                </th>

                <th className="p-4 text-left">
                  Student Name
                </th>

                <th className="p-4 text-left">
                  Class
                </th>

                <th className="p-4 text-left">
                  Team
                </th>

                <th className="p-4 text-left">
                  Category
                </th>

                <th className="p-4 text-left">
                  Gender
                </th>

                <th className="p-4 text-left">
                  Assigned Programme(s)
                </th>

                <th className="p-4 text-center">
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
                      className="border-b hover:bg-green-50 align-top"
                    >

                      <td className="p-4">
                        {index + 1}
                      </td>

                      <td className="p-4 font-semibold">
                        {student.admission_no || "-"}
                      </td>

                      <td className="p-4 font-semibold">
                        {student.student_name || "-"}
                      </td>

                      <td className="p-4">
                        {student.class || "-"}
                      </td>

                      <td className="p-4 font-bold">
                        {student.team || "-"}
                      </td>

                      <td className="p-4">
                        {student.category || "-"}
                      </td>

                      <td className="p-4">
                        {student.gender || "-"}
                      </td>

                      {/* PROGRAMMES */}

                      <td className="p-4 align-top">
                        {assigned ? (
                          <div className="text-sm leading-6 text-gray-800">
                            {studentProgrammes.map(
                              (programme, programmeIndex) => (
                                <span
                                  key={`${student.id}-${programme}-${programmeIndex}`}
                                >
                                  {programme}
                                  {programmeIndex <
                                    studentProgrammes.length - 1 && (
                                    <span className="mx-1 text-gray-400">
                                      •
                                    </span>
                                  )}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* STATUS */}

                      <td className="p-4 text-center">

                        {assigned ? (

                          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                            ✅ Assigned
                          </span>

                        ) : (

                          <span className="inline-block bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                            ⚪ Not Assigned
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

    </DashboardLayout>
  );
}