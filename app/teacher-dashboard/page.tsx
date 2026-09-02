"use client";

import DashboardLayout from "../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const TEAMS = ["DIJLA", "FURATH", "NILE", "SAIHOON"];

const CATEGORY_LIMITS: Record<
  string,
  {
    stage: number;
    offStage: number;
    group: number;
    general: number;
  }
> = {
  Kiddies: {
    stage: 2,
    offStage: 2,
    group: 1,
    general: 0,
  },

  "Sub-junior": {
    stage: 4,
    offStage: 3,
    group: 1,
    general: 1,
  },

  Junior: {
    stage: 6,
    offStage: 5,
    group: 1,
    general: 1,
  },

  Senior: {
    stage: 7,
    offStage: 9,
    group: 1,
    general: 1,
  },
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
    return "Sub-junior";
  }

  if (category === "junior") {
    return "Junior";
  }

  if (category === "senior") {
    return "Senior";
  }

  return value;
}

export default function TeacherDashboardPage() {
  const [teacherName, setTeacherName] = useState("");

  const [selectedTeam, setSelectedTeam] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] =
    useState<any[]>([]);

  const [admissionSearch, setAdmissionSearch] =
    useState("");

  const [nameSearch, setNameSearch] =
    useState("");

  const [selectedStudent, setSelectedStudent] =
    useState<any>(null);

  const [programmes, setProgrammes] =
    useState<any[]>([]);

  const [selectedProgrammes, setSelectedProgrammes] =
    useState<any[]>([]);

  const [existingProgrammes, setExistingProgrammes] =
    useState<any[]>([]);

  const [loadingStudents, setLoadingStudents] =
    useState(false);

  const [loadingProgrammes, setLoadingProgrammes] =
    useState(false);

  const [saving, setSaving] = useState(false);

  // --------------------------------------------------
  // CHECK TEACHER LOGIN
  // --------------------------------------------------

  useEffect(() => {
    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      window.location.href = "/login";
      return;
    }

    try {
      const user = JSON.parse(savedUser);

      if (user.role !== "teacher") {
        window.location.href = "/login";
        return;
      }

      setTeacherName(
        user.full_name ||
          user.name ||
          user.username ||
          "Teacher"
      );
    } catch {
      window.location.href = "/login";
    }
  }, []);

  // --------------------------------------------------
  // LOAD TEAM STUDENTS
  // --------------------------------------------------

  async function loadTeamStudents(team: string) {
    setSelectedTeam(team);

    setStudents([]);
    setFilteredStudents([]);

    setAdmissionSearch("");
    setNameSearch("");

    setSelectedStudent(null);
    setProgrammes([]);
    setSelectedProgrammes([]);
    setExistingProgrammes([]);

    if (!team) {
      return;
    }

    setLoadingStudents(true);

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .ilike("team", team.trim())
      .order("student_name");

    if (error) {
      setLoadingStudents(false);
      console.error(error);
      alert(error.message);
      return;
    }

    const studentList = data || [];

    // Load all programme registrations for the students in this team.
    const admissionNumbers = studentList
      .map((student) => String(student.admission_no || "").trim())
      .filter(Boolean);

    let registrationData: any[] = [];

    if (admissionNumbers.length > 0) {
      const {
        data: registrations,
        error: registrationError,
      } = await supabase
        .from("registrations")
        .select("id, admission_no, programme_id, programme_name")
        .in("admission_no", admissionNumbers);

      if (registrationError) {
        console.error(
          "Registration loading error:",
          registrationError
        );
      } else {
        registrationData = registrations || [];
      }
    }

    // Attach assigned programmes to every student.
    const studentsWithProgrammes = studentList.map(
      (student) => ({
        ...student,
        assignedProgrammes: registrationData.filter(
          (registration) =>
            String(registration.admission_no || "").trim() ===
            String(student.admission_no || "").trim()
        ),
      })
    );

    setStudents(studentsWithProgrammes);
    setFilteredStudents(studentsWithProgrammes);
    setLoadingStudents(false);
  }

  // --------------------------------------------------
  // SEARCH WITHIN SELECTED TEAM
  // --------------------------------------------------

  function searchStudents() {
    if (!selectedTeam) {
      alert("Please select a team first.");
      return;
    }

    const admission =
      admissionSearch.trim().toLowerCase();

    const name =
      nameSearch.trim().toLowerCase();

    if (!admission && !name) {
      setFilteredStudents(students);
      return;
    }

    const results = students.filter(
      (student) => {
        const studentAdmission =
          String(
            student.admission_no || ""
          ).toLowerCase();

        const studentName =
          String(
            student.student_name || ""
          ).toLowerCase();

        const admissionMatches =
          !admission ||
          studentAdmission.includes(admission);

        const nameMatches =
          !name ||
          studentName.includes(name);

        return (
          admissionMatches &&
          nameMatches
        );
      }
    );

    setFilteredStudents(results);
  }

  // --------------------------------------------------
  // CLEAR SEARCH
  // --------------------------------------------------

  function clearSearch() {
    setAdmissionSearch("");
    setNameSearch("");
    setFilteredStudents(students);
  }

  // --------------------------------------------------
  // GET PROGRAMME SECTION
  // --------------------------------------------------

  function getSection(programme: any) {
    const programmeType = String(
      programme.programme_type || ""
    )
      .trim()
      .toLowerCase();

    const eventType = String(
      programme.event_type || ""
    )
      .trim()
      .toLowerCase();

    if (programmeType === "group") {
      return "group";
    }

    if (programmeType === "general") {
      return "general";
    }

    if (
      programmeType === "individual" &&
      eventType === "stage"
    ) {
      return "stage";
    }

    if (
      programmeType === "individual" &&
      (
        eventType === "off stage" ||
        eventType === "off-stage" ||
        eventType === "off_stage" ||
        eventType === "offstage"
      )
    ) {
      return "offStage";
    }

    return "";
  }

  // --------------------------------------------------
  // SELECT STUDENT
  // --------------------------------------------------

  async function selectStudent(student: any) {
    setSelectedStudent(student);

    setProgrammes([]);
    setSelectedProgrammes([]);
    setExistingProgrammes([]);

    setLoadingProgrammes(true);

    const category =
      normalizeCategory(student.category);

    const gender = String(
      student.gender || ""
    )
      .trim()
      .toLowerCase();

    let genderValues: string[] = [
      "Common",
    ];

    if (
      gender === "boys" ||
      gender === "boy"
    ) {
      genderValues = [
        "Common",
        "Boys",
      ];
    }

    if (
      gender === "girls" ||
      gender === "girl"
    ) {
      genderValues = [
        "Common",
        "Girls",
      ];
    }

    // Same programme filtering as Parent Portal
    const {
      data: programmeData,
      error: programmeError,
    } = await supabase
      .from("programmes")
      .select("*")
      .in("category", [
        category,
        "General",
      ])
      .in("gender", genderValues)
      .eq("is_active", true)
      .order("programme_name");

    if (programmeError) {
      console.error(programmeError);
      alert(programmeError.message);
      setLoadingProgrammes(false);
      return;
    }

    setProgrammes(programmeData || []);

    // ------------------------------------------------
    // LOAD ALREADY ASSIGNED PROGRAMMES
    // ------------------------------------------------

    const {
      data: registrations,
      error: registrationError,
    } = await supabase
      .from("registrations")
      .select("*")
      .eq(
        "admission_no",
        student.admission_no
      );

    if (registrationError) {
      console.error(registrationError);
    }

    const existing =
      (registrations || [])
        .map((registration) =>
          (programmeData || []).find(
            (programme) =>
              String(programme.id) ===
              String(
                registration.programme_id
              )
          )
        )
        .filter(Boolean);

    setExistingProgrammes(existing);
    setSelectedProgrammes(existing);

    setLoadingProgrammes(false);
  }

  // --------------------------------------------------
  // SELECTED COUNT
  // --------------------------------------------------

  function getSelectedCount(
    section: string
  ) {
    return selectedProgrammes.filter(
      (programme) =>
        getSection(programme) ===
        section
    ).length;
  }

  // --------------------------------------------------
  // TOGGLE PROGRAMME
  // --------------------------------------------------

  function toggleProgramme(
    programme: any
  ) {
    const alreadySelected =
      selectedProgrammes.some(
        (p) => p.id === programme.id
      );

    // Allow removing
    if (alreadySelected) {
      setSelectedProgrammes(
        selectedProgrammes.filter(
          (p) => p.id !== programme.id
        )
      );

      return;
    }

    const section =
      getSection(programme);

    if (!section) {
      return;
    }

    const category =
      normalizeCategory(
        selectedStudent?.category
      );

    const limits =
      CATEGORY_LIMITS[category];

    if (!limits) {
      alert(
        "No programme limits found for this category."
      );
      return;
    }

    const limit =
      section === "stage"
        ? limits.stage
        : section === "offStage"
        ? limits.offStage
        : section === "group"
        ? limits.group
        : section === "general"
        ? limits.general
        : 0;

    const currentCount =
      getSelectedCount(section);

    if (currentCount >= limit) {
      const sectionName =
        section === "stage"
          ? "Stage"
          : section === "offStage"
          ? "Off Stage"
          : section === "group"
          ? "Group"
          : "General";

      alert(
        `${category} students can select maximum ${limit} programme(s) from ${sectionName}.`
      );

      return;
    }

    setSelectedProgrammes([
      ...selectedProgrammes,
      programme,
    ]);
  }

  // --------------------------------------------------
  // ASSIGN PROGRAMMES
  // --------------------------------------------------

  async function assignProgrammes() {
    if (!selectedStudent) {
      alert("Please select a student.");
      return;
    }

    if (selectedProgrammes.length === 0) {
      alert(
        "Please select at least one programme."
      );
      return;
    }

    setSaving(true);

    // Only add programmes that were not
    // already registered.
    const newProgrammes =
      selectedProgrammes.filter(
        (programme) =>
          !existingProgrammes.some(
            (existing) =>
              existing.id ===
              programme.id
          )
      );

    if (newProgrammes.length === 0) {
      alert(
        "All selected programmes are already assigned to this student."
      );

      setSaving(false);
      return;
    }

    for (const programme of newProgrammes) {
      const {
        data: duplicate,
        error: duplicateError,
      } = await supabase
        .from("registrations")
        .select("id")
        .eq(
          "admission_no",
          selectedStudent.admission_no
        )
        .eq(
          "programme_id",
          programme.id
        )
        .maybeSingle();

      if (duplicateError) {
        console.error(
          duplicateError
        );
        alert(
          duplicateError.message
        );
        setSaving(false);
        return;
      }

      if (duplicate) {
        continue;
      }

      const {
        error: insertError,
      } = await supabase
        .from("registrations")
        .insert({
          admission_no:
            selectedStudent.admission_no,

          student_name:
            selectedStudent.student_name,

          chest_no:
            selectedStudent.chest_no,

          category:
            selectedStudent.category,

          team:
            selectedStudent.team,

          programme_id:
            programme.id,

          programme_name:
            programme.programme_name,

          programme_type:
            programme.programme_type,
        });

      if (insertError) {
        console.error(
          insertError
        );

        alert(
          insertError.message
        );

        setSaving(false);
        return;
      }
    }

    alert(
      `Programme(s) assigned successfully to ${selectedStudent.student_name}.`
    );

    // Reload the student's existing assignments
    await selectStudent(
      selectedStudent
    );

    setSaving(false);
  }

  // --------------------------------------------------
  // PROGRAMME LIST
  // --------------------------------------------------

  function ProgrammeList({
    programmes,
  }: {
    programmes: any[];
  }) {
    if (programmes.length === 0) {
      return (
        <p className="text-gray-500">
          No programmes available.
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

        {programmes.map(
          (programme) => {
            const selected =
              selectedProgrammes.some(
                (p) =>
                  p.id ===
                  programme.id
              );

            const alreadyAssigned =
              existingProgrammes.some(
                (p) =>
                  p.id ===
                  programme.id
              );

            return (
              <button
                key={programme.id}
                type="button"
                onClick={() =>
                  toggleProgramme(
                    programme
                  )
                }
                className={`text-left p-4 rounded-xl border-2 transition ${
                  selected
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white border-gray-300 hover:bg-green-50 hover:border-green-500"
                }`}
              >

                <div className="flex items-center gap-3">

                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      selected
                        ? "bg-white border-white text-green-700"
                        : "border-gray-400"
                    }`}
                  >
                    {selected &&
                      "✓"}
                  </div>

                  <div>

                    <div className="font-semibold">
                      {
                        programme.programme_name
                      }
                    </div>

                    {alreadyAssigned && (
                      <div
                        className={`text-xs mt-1 ${
                          selected
                            ? "text-green-100"
                            : "text-green-700"
                        }`}
                      >
                        ✓ Already Assigned
                      </div>
                    )}

                  </div>

                </div>

              </button>
            );
          }
        )}

      </div>
    );
  }

  // --------------------------------------------------
  // PROGRAMME FILTERS
  // --------------------------------------------------

  const stageProgrammes =
    programmes.filter(
      (p) =>
        getSection(p) ===
        "stage"
    );

  const offStageProgrammes =
    programmes.filter(
      (p) =>
        getSection(p) ===
        "offStage"
    );

  const groupProgrammes =
    programmes.filter(
      (p) =>
        getSection(p) ===
        "group"
    );

  const generalProgrammes =
    programmes.filter(
      (p) =>
        getSection(p) ===
        "general"
    );

  const category =
    selectedStudent
      ? normalizeCategory(
          selectedStudent.category
        )
      : "";

  const limits =
    category
      ? CATEGORY_LIMITS[
          category
        ]
      : null;

  const stageCount =
    getSelectedCount("stage");

  const offStageCount =
    getSelectedCount(
      "offStage"
    );

  const groupCount =
    getSelectedCount("group");

  const generalCount =
    getSelectedCount(
      "general"
    );

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <DashboardLayout>

      {/* HEADER */}

      <div className="bg-green-900 text-white rounded-2xl p-8 mb-8">

        <h1 className="text-3xl font-bold">
          👨‍🏫 Teacher Dashboard
        </h1>

        <p className="mt-2 text-green-100">
          Welcome, {teacherName}
        </p>

      </div>

      {/* TEAM SELECTION */}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">

        <h2 className="text-2xl font-bold mb-2">
          👥 Select Team
        </h2>

        <p className="text-gray-500 mb-5">
          Select a team to view its students.
        </p>

        <select
          value={selectedTeam}
          onChange={(e) =>
            loadTeamStudents(
              e.target.value
            )
          }
          className="w-full md:w-96 border rounded-lg p-4 text-lg font-semibold"
        >

          <option value="">
            Select Team
          </option>

          {TEAMS.map((team) => (
            <option
              key={team}
              value={team}
            >
              {team}
            </option>
          ))}

        </select>

      </div>

      {/* SEARCH */}

      {selectedTeam && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">

          <h2 className="text-2xl font-bold mb-2">
            🔍 Search Students
          </h2>

          <p className="text-gray-500 mb-5">
            Search within the selected{" "}
            <strong>
              {selectedTeam}
            </strong>{" "}
            team.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <input
              type="text"
              value={
                admissionSearch
              }
              onChange={(e) =>
                setAdmissionSearch(
                  e.target.value
                )
              }
              placeholder="Admission Number"
              className="border rounded-lg p-3"
            />

            <input
              type="text"
              value={nameSearch}
              onChange={(e) =>
                setNameSearch(
                  e.target.value
                )
              }
              placeholder="Student Name"
              className="border rounded-lg p-3"
            />

            <button
              type="button"
              onClick={
                searchStudents
              }
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-bold"
            >
              🔍 Search
            </button>

          </div>

          <button
            type="button"
            onClick={
              clearSearch
            }
            className="mt-3 text-gray-600 underline"
          >
            Clear Search
          </button>

        </div>
      )}

      {/* STUDENT LIST */}

      {selectedTeam && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

          <div className="flex justify-between items-center mb-5">

            <div>
              <h2 className="text-2xl font-bold">
                👨‍🎓{" "}
                {selectedTeam} Students
              </h2>

              <p className="text-gray-500 mt-1">
                Showing{" "}
                {
                  filteredStudents.length
                }{" "}
                student(s)
              </p>
            </div>

          </div>

          {loadingStudents ? (

            <p className="text-gray-500">
              Loading students...
            </p>

          ) : filteredStudents.length ===
            0 ? (

            <div className="bg-gray-50 rounded-xl p-8 text-center">

              <p className="text-gray-500">
                No students found.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px] border-collapse">

                <thead>

                  <tr className="bg-gray-100 border-b">

                    <th className="text-left p-3">
                      Admission No
                    </th>

                    <th className="text-left p-3">
                      Student Name
                    </th>

                    <th className="text-left p-3">
                      Class
                    </th>

                    <th className="text-left p-3">
                      Team
                    </th>

                    <th className="text-left p-3">
                      Category
                    </th>

                    <th className="text-left p-3">
                      Gender
                    </th>

                    <th className="text-left p-3">
                      Assigned Programme(s)
                    </th>

                    <th className="text-left p-3">
                      Status
                    </th>

                    <th className="text-left p-3">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredStudents.map(
                    (student) => (
                      <tr
                        key={student.id}
                        className="border-b hover:bg-gray-50"
                      >

                        <td className="p-3">
                          {
                            student.admission_no
                          }
                        </td>

                        <td className="p-3 font-semibold">
                          {
                            student.student_name
                          }
                        </td>

                        <td className="p-3">
                          {student.class}
                        </td>

                        <td className="p-3 font-semibold uppercase">
                          {student.team}
                        </td>

                        <td className="p-3">
                          {student.category}
                        </td>

                        <td className="p-3">
                          {student.gender}
                        </td>

                        <td className="p-3 align-top text-sm">
                          {student.assignedProgrammes?.length > 0 ? (
                            <div className="leading-6 text-gray-800">
                              {student.assignedProgrammes.map(
                                (programme: any, index: number) => (
                                  <span key={programme.id}>
                                    {programme.programme_name}
                                    {index <
                                      student.assignedProgrammes.length - 1 && (
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

                        <td className="p-3">
                          {student.assignedProgrammes?.length > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 whitespace-nowrap">
                              ✓ Assigned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-500 whitespace-nowrap">
                              ○ Not Assigned
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() =>
                              selectStudent(student)
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold whitespace-nowrap"
                          >
                            🎭 Assign Programme
                          </button>
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>
      )}

      {/* SELECTED STUDENT */}

      {selectedStudent && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

          <div className="flex justify-between items-start mb-6">

            <div>

              <h2 className="text-2xl font-bold">
                🎭 Programme Assignment
              </h2>

              <p className="text-gray-600 mt-2">
                Student:{" "}
                <strong>
                  {
                    selectedStudent.student_name
                  }
                </strong>
              </p>

              <p className="text-gray-600">
                Admission No:{" "}
                <strong>
                  {
                    selectedStudent.admission_no
                  }
                </strong>
              </p>

              <p className="text-gray-600">
                Class:{" "}
                <strong>
                  {
                    selectedStudent.class
                  }
                </strong>
              </p>

              <p className="text-gray-600">
                Category:{" "}
                <strong>
                  {category}
                </strong>
              </p>

              <p className="text-gray-600">
                Team:{" "}
                <strong>
                  {
                    selectedStudent.team
                  }
                </strong>
              </p>

            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedStudent(
                  null
                );
                setProgrammes([]);
                setSelectedProgrammes([]);
                setExistingProgrammes([]);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold"
            >
              ✕ Close
            </button>

          </div>

          {loadingProgrammes ? (

            <p className="text-gray-500">
              Loading programmes...
            </p>

          ) : limits ? (

            <div className="space-y-6">

              {/* STAGE */}

              <section className="bg-gray-50 rounded-2xl p-6 border">

                <div className="flex justify-between items-center mb-5">

                  <h3 className="text-2xl font-bold text-green-700">
                    🎤 Stage
                  </h3>

                  <span className="font-bold text-green-700">
                    {stageCount} /{" "}
                    {limits.stage}
                  </span>

                </div>

                <ProgrammeList
                  programmes={
                    stageProgrammes
                  }
                />

              </section>

              {/* OFF STAGE */}

              <section className="bg-gray-50 rounded-2xl p-6 border">

                <div className="flex justify-between items-center mb-5">

                  <h3 className="text-2xl font-bold text-orange-600">
                    📝 Off Stage
                  </h3>

                  <span className="font-bold text-orange-600">
                    {
                      offStageCount
                    }{" "}
                    /{" "}
                    {
                      limits.offStage
                    }
                  </span>

                </div>

                <ProgrammeList
                  programmes={
                    offStageProgrammes
                  }
                />

              </section>

              {/* GROUP */}

              <section className="bg-gray-50 rounded-2xl p-6 border">

                <div className="flex justify-between items-center mb-5">

                  <h3 className="text-2xl font-bold text-blue-700">
                    👥 Group
                  </h3>

                  <span className="font-bold text-blue-700">
                    {groupCount} /{" "}
                    {limits.group}
                  </span>

                </div>

                <ProgrammeList
                  programmes={
                    groupProgrammes
                  }
                />

              </section>

              {/* GENERAL */}

              <section className="bg-gray-50 rounded-2xl p-6 border">

                <div className="flex justify-between items-center mb-5">

                  <h3 className="text-2xl font-bold text-purple-700">
                    🏆 General
                  </h3>

                  <span className="font-bold text-purple-700">
                    {generalCount} /{" "}
                    {limits.general}
                  </span>

                </div>

                <ProgrammeList
                  programmes={
                    generalProgrammes
                  }
                />

              </section>

              {/* ASSIGN BUTTON */}

              <div className="text-center pb-8">

                <button
                  type="button"
                  onClick={
                    assignProgrammes
                  }
                  disabled={
                    saving ||
                    selectedProgrammes.length ===
                      0
                  }
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-10 py-4 rounded-xl font-bold text-lg"
                >
                  {saving
                    ? "Assigning..."
                    : "💾 Assign Selected Programmes"}
                </button>

              </div>

            </div>

          ) : (

            <div className="bg-yellow-50 text-yellow-800 rounded-xl p-5">
              No programme limits found for this student's category.
            </div>

          )}

        </div>
      )}

    </DashboardLayout>
  );
}