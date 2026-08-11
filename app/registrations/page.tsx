"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import BackButton from "../components/layout/BackButton";
import { supabase } from "@/lib/supabase";

type Student = {
  id: number;
  admission_no: string;
  student_name: string;
  class: string;
  category: string;
  team: string;
  gender?: string;
};

type Programme = {
  id: number;
  programme_name: string;
  programme_code: string;
  programme_type: string;
  participant_type: string;
  venue_type: string;
  event_type: string;
  point_rule: string;
};

type Registration = {
  id: number;
  admission_no: string;
  student_name: string;
  class: string;
  category: string;
  team: string;
  gender?: string;
  programme_name: string;
  participant_type: string;
  programme_type: string;
  status: string;
};

function normalizeCategory(value: string) {
  const category = String(value || "")
    .trim()
    .toLowerCase();

  if (category === "kiddies") {
    return "Kiddies";
  }

  if (
    category === "sub junior" ||
    category === "sub-junior" ||
    category === "subjunior"
  ) {
    return "Sub-Junior";
  }

  if (category === "junior") {
    return "Junior";
  }

  if (category === "senior") {
    return "Senior";
  }

  return value;
}

export default function RegistrationsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [registrations, setRegistrations] = useState<
    Registration[]
  >([]);

  const [selectedStudent, setSelectedStudent] =
    useState("");

  const [selectedProgramme, setSelectedProgramme] =
    useState("");

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: studentData } = await supabase
      .from("students")
      .select("*")
      .order("student_name");

    const { data: programmeData } = await supabase
      .from("programmes")
      .select("*")
      .order("programme_name");

    const { data: registrationData } = await supabase
      .from("registrations")
      .select("*")
      .order("id", {
        ascending: false,
      });

    setStudents(studentData || []);
    setProgrammes(programmeData || []);
    setRegistrations(registrationData || []);
  }

  async function saveRegistration() {
    if (!selectedStudent || !selectedProgramme) {
      alert("Please select Student and Programme");
      return;
    }

    const student = students.find(
      (s) =>
        String(s.admission_no) === selectedStudent
    );

    const programme = programmes.find(
      (p) =>
        String(p.id) === selectedProgramme
    );

    if (!student || !programme) {
      alert("Invalid Student or Programme");
      return;
    }

    const { data: existing } = await supabase
      .from("registrations")
      .select("id")
      .eq(
        "admission_no",
        student.admission_no
      )
      .eq(
        "programme_id",
        programme.id
      );

    if (existing && existing.length > 0) {
      alert(
        "Student is already registered for this programme."
      );
      return;
    }

    const { error } = await supabase
      .from("registrations")
      .insert({
        admission_no: student.admission_no,
        student_name: student.student_name,
        class: student.class,
        category: student.category,
        team: student.team,

        programme_id: programme.id,
        programme_code: programme.programme_code,
        programme_name: programme.programme_name,
        programme_type: programme.programme_type,
        participant_type:
          programme.participant_type,
        venue_type: programme.venue_type,
        event_type: programme.event_type,
        point_rule: programme.point_rule,

        assigned_at: new Date().toISOString(),
        status: "Registered",
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("✅ Registration Saved");

    setSelectedStudent("");
    setSelectedProgramme("");

    loadData();
  }

  async function deleteRegistration(
    id: number
  ) {
    if (!confirm("Delete this registration?")) {
      return;
    }

    await supabase
      .from("registrations")
      .delete()
      .eq("id", id);

    loadData();
  }

  /*
   * SEARCH + CATEGORY FILTER
   */

  const filteredRegistrations =
    registrations.filter((registration) => {
      const searchText = (
        registration.admission_no +
        registration.student_name +
        registration.programme_name +
        registration.team +
        registration.category
      ).toLowerCase();

      const matchesSearch =
        searchText.includes(
          search.toLowerCase()
        );

      const matchesCategory =
        selectedCategory === "All" ||
        normalizeCategory(
          registration.category
        ) === selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  /*
   * PRINT
   */

  function printReport() {
    window.print();
  }

  /*
   * CATEGORY COUNTS
   */

  const kiddiesCount =
    registrations.filter(
      (r) =>
        normalizeCategory(r.category) ===
        "Kiddies"
    ).length;

  const subJuniorCount =
    registrations.filter(
      (r) =>
        normalizeCategory(r.category) ===
        "Sub-Junior"
    ).length;

  const juniorCount =
    registrations.filter(
      (r) =>
        normalizeCategory(r.category) ===
        "Junior"
    ).length;

  const seniorCount =
    registrations.filter(
      (r) =>
        normalizeCategory(r.category) ===
        "Senior"
    ).length;

  return (
    <DashboardLayout>

      <div className="print:p-0">

        <div className="print:hidden">
          <BackButton />
        </div>

        {/* HEADER */}

        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-4xl font-bold">
              📝 Registration Management
            </h1>

            <p className="text-gray-500 mt-2">
              Total Registrations :{" "}
              {registrations.length}
            </p>
          </div>

        </div>

        {/* REGISTRATION FORM */}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print:hidden">

          <div className="grid md:grid-cols-2 gap-6">

            <select
              className="border rounded-lg p-3"
              value={selectedStudent}
              onChange={(e) =>
                setSelectedStudent(
                  e.target.value
                )
              }
            >
              <option value="">
                Select Student
              </option>

              {students.map((student) => (
                <option
                  key={student.id}
                  value={student.admission_no}
                >
                  {student.admission_no} -{" "}
                  {student.student_name}
                </option>
              ))}
            </select>

            <select
              className="border rounded-lg p-3"
              value={selectedProgramme}
              onChange={(e) =>
                setSelectedProgramme(
                  e.target.value
                )
              }
            >
              <option value="">
                Select Programme
              </option>

              {programmes.map((programme) => (
                <option
                  key={programme.id}
                  value={programme.id}
                >
                  {programme.programme_name}
                </option>
              ))}
            </select>

          </div>

          <button
            onClick={saveRegistration}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
          >
            ✅ Register Student
          </button>

        </div>

        {/* CATEGORY SUMMARY */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 print:hidden">

          <button
            onClick={() =>
              setSelectedCategory("Kiddies")
            }
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100"
          >
            <p className="text-gray-500">
              Kiddies
            </p>
            <p className="text-2xl font-bold">
              {kiddiesCount}
            </p>
          </button>

          <button
            onClick={() =>
              setSelectedCategory(
                "Sub-Junior"
              )
            }
            className="bg-green-50 border border-green-200 rounded-xl p-4 text-left hover:bg-green-100"
          >
            <p className="text-gray-500">
              Sub-Junior
            </p>
            <p className="text-2xl font-bold">
              {subJuniorCount}
            </p>
          </button>

          <button
            onClick={() =>
              setSelectedCategory("Junior")
            }
            className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left hover:bg-orange-100"
          >
            <p className="text-gray-500">
              Junior
            </p>
            <p className="text-2xl font-bold">
              {juniorCount}
            </p>
          </button>

          <button
            onClick={() =>
              setSelectedCategory("Senior")
            }
            className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-left hover:bg-purple-100"
          >
            <p className="text-gray-500">
              Senior
            </p>
            <p className="text-2xl font-bold">
              {seniorCount}
            </p>
          </button>

        </div>

        {/* FILTER + PRINT */}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 print:hidden">

          <div className="flex flex-col md:flex-row gap-4">

            <select
              className="border rounded-lg p-3 md:w-64"
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value
                )
              }
            >
              <option value="All">
                All Categories
              </option>

              <option value="Kiddies">
                Kiddies
              </option>

              <option value="Sub-Junior">
                Sub-Junior
              </option>

              <option value="Junior">
                Junior
              </option>

              <option value="Senior">
                Senior
              </option>
            </select>

            <input
              type="text"
              placeholder="🔍 Search Admission / Student / Programme..."
              className="flex-1 border rounded-lg p-3"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <button
              onClick={loadData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold"
            >
              🔄 Refresh
            </button>

            <button
              onClick={printReport}
              className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-3 rounded-lg font-bold"
            >
              🖨 Print / Save PDF
            </button>

          </div>

        </div>

        {/* PRINT REPORT HEADER */}

        <div className="hidden print:block text-center mb-6">

          <h1 className="text-3xl font-bold">
            MUNAFASA 2026
          </h1>

          <h2 className="text-xl font-bold mt-2">
            REGISTERED PROGRAMMES
          </h2>

          <p className="mt-2">
            Category:{" "}
            <strong>
              {selectedCategory}
            </strong>
          </p>

          <p className="text-sm mt-1">
            Generated:{" "}
            {new Date().toLocaleDateString(
              "en-IN"
            )}
          </p>

        </div>

        {/* REPORT */}

        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

          <table className="w-full border-collapse">

            <thead className="bg-blue-900 text-white">

              <tr>

                <th className="p-4 text-left border">
                  #
                </th>

                <th className="p-4 text-left border">
                  Admission No
                </th>

                <th className="p-4 text-left border">
                  Student
                </th>

                <th className="p-4 text-left border">
                  Class
                </th>

                <th className="p-4 text-left border">
                  Gender
                </th>

                <th className="p-4 text-left border">
                  Category
                </th>

                <th className="p-4 text-left border">
                  Team
                </th>

                <th className="p-4 text-left border">
                  Programme
                </th>

                <th className="p-4 text-left border">
                  Type
                </th>

                <th className="p-4 text-left border">
                  Status
                </th>

                <th className="p-4 text-center border print:hidden">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredRegistrations.map(
                (registration, index) => (

                  <tr
                    key={registration.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="p-4 border">
                      {index + 1}
                    </td>

                    <td className="p-4 border">
                      {
                        registration.admission_no
                      }
                    </td>

                    <td className="p-4 border font-semibold">
                      {
                        registration.student_name
                      }
                    </td>

                    <td className="p-4 border">
                      {registration.class}
                    </td>

                    <td className="p-4 border">
                      {registration.gender || "-"}
                    </td>

                    <td className="p-4 border font-semibold">
                      {registration.category}
                    </td>

                    <td className="p-4 border">
                      {registration.team}
                    </td>

                    <td className="p-4 border font-semibold">
                      {
                        registration.programme_name
                      }
                    </td>

                    <td className="p-4 border">
                      {
                        registration.programme_type
                      }
                    </td>

                    <td className="p-4 border">

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        {registration.status}
                      </span>

                    </td>

                    <td className="p-4 border text-center print:hidden">

                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() =>
                          deleteRegistration(
                            registration.id
                          )
                        }
                      >
                        🗑 Delete
                      </button>

                    </td>

                  </tr>

                )
              )}

              {filteredRegistrations.length ===
                0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="p-8 text-center text-gray-500"
                  >
                    No registrations found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* PRINT FOOTER */}

        <div className="hidden print:block text-center mt-6 text-sm">

          <p>
            MUNAFASA 2026 — Global Public School
          </p>

          <p className="mt-1">
            Total Records:{" "}
            {filteredRegistrations.length}
          </p>

        </div>

      </div>

    </DashboardLayout>
  );
}