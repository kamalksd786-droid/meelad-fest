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
  chest_no?: string;
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
  chest_no?: string;
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

  // ==================================================
  // BULK DELETE SELECTION
  // ==================================================

  const [selectedRegistrations, setSelectedRegistrations] =
    useState<number[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  // ==================================================
  // LOAD DATA
  // ==================================================

  async function loadData() {
    const { data: studentData, error: studentError } =
      await supabase
        .from("students")
        .select("*")
        .order("student_name");

    if (studentError) {
      console.error(
        "Student loading error:",
        studentError
      );
    }

    const { data: programmeData, error: programmeError } =
      await supabase
        .from("programmes")
        .select("*")
        .order("programme_name");

    if (programmeError) {
      console.error(
        "Programme loading error:",
        programmeError
      );
    }

    const {
      data: registrationData,
      error: registrationError,
    } = await supabase
      .from("registrations")
      .select("*")
      .order("id", {
        ascending: false,
      });

    if (registrationError) {
      console.error(
        "Registration loading error:",
        registrationError
      );
    }

    const studentMap = new Map(
      (studentData || []).map((student) => [
        String(student.admission_no),
        student,
      ])
    );

    const enrichedRegistrations = (registrationData || []).map(
      (registration) => {
        const student = studentMap.get(
          String(registration.admission_no)
        );

        return {
          ...registration,
          gender: registration.gender || student?.gender || "-",
          chest_no: registration.chest_no || student?.chest_no || "-",
        };
      }
    );

    setStudents(studentData || []);
    setProgrammes(programmeData || []);
    setRegistrations(enrichedRegistrations);

    // Remove selections that no longer exist
    const currentIds = new Set(
      (registrationData || []).map(
        (registration) => registration.id
      )
    );

    setSelectedRegistrations((previous) =>
      previous.filter((id) => currentIds.has(id))
    );
  }

  // ==================================================
  // SAVE REGISTRATION
  // ==================================================

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
        gender: student.gender,
        chest_no: student.chest_no,

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

  // ==================================================
  // DELETE ONE REGISTRATION
  // ==================================================

  async function deleteRegistration(
    id: number
  ) {
    if (!confirm("Delete this registration?")) {
      return;
    }

    const { error } = await supabase
      .from("registrations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setSelectedRegistrations((previous) =>
      previous.filter(
        (selectedId) => selectedId !== id
      )
    );

    loadData();
  }

  // ==================================================
  // BULK DELETE
  // ==================================================

  async function bulkDeleteRegistrations() {
    if (selectedRegistrations.length === 0) {
      alert(
        "Please select at least one registration."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedRegistrations.length} selected registration(s)?`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("registrations")
      .delete()
      .in("id", selectedRegistrations);

    if (error) {
      console.error(
        "Bulk delete error:",
        error
      );

      alert(error.message);
      return;
    }

    alert(
      `✅ ${selectedRegistrations.length} registration(s) deleted successfully.`
    );

    setSelectedRegistrations([]);

    loadData();
  }

  // ==================================================
  // SEARCH + CATEGORY FILTER
  // ==================================================

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

  // ==================================================
  // SELECT ALL
  // ==================================================

  const allFilteredSelected =
    filteredRegistrations.length > 0 &&
    filteredRegistrations.every(
      (registration) =>
        selectedRegistrations.includes(
          registration.id
        )
    );

  function toggleSelectAll() {
    if (allFilteredSelected) {
      const filteredIds = new Set(
        filteredRegistrations.map(
          (registration) =>
            registration.id
        )
      );

      setSelectedRegistrations((previous) =>
        previous.filter(
          (id) => !filteredIds.has(id)
        )
      );

      return;
    }

    const filteredIds =
      filteredRegistrations.map(
        (registration) =>
          registration.id
      );

    setSelectedRegistrations((previous) => [
      ...new Set([
        ...previous,
        ...filteredIds,
      ]),
    ]);
  }

  // ==================================================
  // SELECT ONE
  // ==================================================

  function toggleRegistration(
    id: number
  ) {
    setSelectedRegistrations((previous) => {
      if (previous.includes(id)) {
        return previous.filter(
          (selectedId) =>
            selectedId !== id
        );
      }

      return [...previous, id];
    });
  }

  // ==================================================
  // PRINT
  // ==================================================

  function printReport() {
    window.print();
  }

  // ==================================================
  // CATEGORY COUNTS
  // ==================================================

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

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <DashboardLayout>

      <div className="print:p-0">

        {/* BACK BUTTON */}

        <div className="print:hidden">
          <BackButton />
        </div>

        {/* ==================================================
            HEADER
        ================================================== */}

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

        {/* ==================================================
            REGISTRATION FORM
        ================================================== */}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print:hidden">

          <div className="grid md:grid-cols-2 gap-6">

            {/* STUDENT */}

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

            {/* PROGRAMME */}

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

        {/* ==================================================
            CATEGORY SUMMARY
        ================================================== */}

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

        {/* ==================================================
            FILTER + BULK DELETE + PRINT
        ================================================== */}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 print:hidden">

          <div className="flex flex-col md:flex-row gap-4">

            {/* CATEGORY */}

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

            {/* SEARCH */}

            <input
              type="text"
              placeholder="🔍 Search Admission / Student / Programme..."
              className="flex-1 border rounded-lg p-3"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {/* SELECT ALL */}

            <button
              onClick={toggleSelectAll}
              disabled={
                filteredRegistrations.length === 0
              }
              className="bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white px-5 py-3 rounded-lg font-bold"
            >
              ☑️{" "}
              {allFilteredSelected
                ? "Unselect All"
                : "Select All"}
            </button>

            {/* DELETE SELECTED */}

            <button
              onClick={
                bulkDeleteRegistrations
              }
              disabled={
                selectedRegistrations.length === 0
              }
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-5 py-3 rounded-lg font-bold"
            >
              🗑️ Delete Selected (
              {selectedRegistrations.length}
              )
            </button>

            {/* REFRESH */}

            <button
              onClick={loadData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold"
            >
              🔄 Refresh
            </button>

            {/* PRINT */}

            <button
              onClick={printReport}
              className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-3 rounded-lg font-bold"
            >
              🖨 Print / Save PDF
            </button>

          </div>

        </div>

        {/* ==================================================
            PRINT REPORT HEADER
        ================================================== */}

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

        {/* ==================================================
            REGISTRATION TABLE
        ================================================== */}

        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

          <table className="w-full border-collapse">

            <thead className="bg-blue-900 text-white">

              <tr>

                {/* SELECT */}

                <th className="p-4 text-center border print:hidden">
                  Select
                </th>

                {/* NUMBER */}

                <th className="p-4 text-left border">
                  #
                </th>

                {/* ADMISSION */}

                <th className="p-4 text-left border">
                  Admission No
                </th>

                {/* STUDENT */}

                <th className="p-4 text-left border">
                  Student
                </th>

                {/* CLASS */}

                <th className="p-4 text-left border">
                  Class
                </th>

                {/* GENDER */}

                <th className="p-4 text-left border">
                  Gender
                </th>

                {/* CHEST NO. */}

                <th className="p-4 text-left border">
                  Chest No.
                </th>

                {/* CATEGORY */}

                <th className="p-4 text-left border">
                  Category
                </th>

                {/* TEAM */}

                <th className="p-4 text-left border">
                  Team
                </th>

                {/* PROGRAMME */}

                <th className="p-4 text-left border">
                  Programme
                </th>

                {/* TYPE */}

                <th className="p-4 text-left border">
                  Type
                </th>

                {/* STATUS */}

                <th className="p-4 text-left border">
                  Status
                </th>

                {/* ACTIONS */}

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

                    {/* CHECKBOX */}

                    <td className="p-4 border text-center print:hidden">

                      <input
                        type="checkbox"
                        checked={selectedRegistrations.includes(
                          registration.id
                        )}
                        onChange={() =>
                          toggleRegistration(
                            registration.id
                          )
                        }
                        className="w-5 h-5 cursor-pointer"
                      />

                    </td>

                    {/* NUMBER */}

                    <td className="p-4 border">
                      {index + 1}
                    </td>

                    {/* ADMISSION */}

                    <td className="p-4 border">
                      {
                        registration.admission_no
                      }
                    </td>

                    {/* STUDENT */}

                    <td className="p-4 border font-semibold">
                      {
                        registration.student_name
                      }
                    </td>

                    {/* CLASS */}

                    <td className="p-4 border">
                      {registration.class}
                    </td>

                    {/* GENDER */}

                    <td className="p-4 border">
                      {registration.gender || "-"}
                    </td>

                    {/* CHEST NO. */}

                    <td className="p-4 border">
                      {registration.chest_no || "-"}
                    </td>

                    {/* CATEGORY */}

                    <td className="p-4 border font-semibold">
                      {registration.category}
                    </td>

                    {/* TEAM */}

                    <td className="p-4 border">
                      {registration.team}
                    </td>

                    {/* PROGRAMME */}

                    <td className="p-4 border font-semibold">
                      {
                        registration.programme_name
                      }
                    </td>

                    {/* TYPE */}

                    <td className="p-4 border">
                      {
                        registration.programme_type
                      }
                    </td>

                    {/* STATUS */}

                    <td className="p-4 border">

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        {registration.status}
                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td className="p-4 border text-center print:hidden">

                      <button
                        className="text-red-600 hover:text-red-800 font-semibold"
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

              {/* NO DATA */}

              {filteredRegistrations.length ===
                0 && (

                <tr>

                  <td
                    colSpan={13}
                    className="p-8 text-center text-gray-500"
                  >
                    No registrations found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* ==================================================
            PRINT FOOTER
        ================================================== */}

        <div className="hidden print:block text-center mt-6 text-sm">

          <p>
            MUNAFASA 2026 — THE GLOBAL PUBLIC SHOOL 
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