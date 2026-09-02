"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Student = {
  admission_no: string;
  chest_no: string;
  student_name: string;
  team: string;
};

type Programme = {
  id: number;
  programme_name: string;
  category: string;
  programme_type: string;
};

type Result = {
  id: number;
  programme_id: number;
  programme_name: string;
  category: string;
  admission_no: string;
  chest_no: string;
  student_name: string;
  team: string;
  position: string;
  points: number;
  group_result_id: string | null;
};

export default function ResultEntryPage() {
  // =========================================================
  // STATES
  // =========================================================

  const [programmeSearch, setProgrammeSearch] = useState("");
  const [selectedProgramme, setSelectedProgramme] = useState("");

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  // Existing individual / group student search
  const [search, setSearch] = useState("");
  const [student, setStudent] = useState<Student | null>(null);

  // Existing group system
  const [groupStudents, setGroupStudents] = useState<Student[]>([]);
  const [selectedPosition, setSelectedPosition] = useState("");

  // New 1st / 2nd / 3rd system
  const [firstSearch, setFirstSearch] = useState("");
  const [secondSearch, setSecondSearch] = useState("");
  const [thirdSearch, setThirdSearch] = useState("");

  const [firstStudent, setFirstStudent] =
    useState<Student | null>(null);

  const [secondStudent, setSecondStudent] =
    useState<Student | null>(null);

  const [thirdStudent, setThirdStudent] =
    useState<Student | null>(null);

  // =========================================================
  // LOAD
  // =========================================================

  useEffect(() => {
    loadProgrammes();
    loadResults();
  }, []);

  // =========================================================
  // LOAD PROGRAMMES
  // =========================================================

  async function loadProgrammes() {
    const { data, error } = await supabase
      .from("programmes")
      .select(
        "id, programme_name, category, programme_type"
      )
      .order("id");

    if (error) {
      console.error("Programme loading error:", error);
      alert(error.message);
      return;
    }

    setProgrammes(data || []);
  }

  // =========================================================
  // LOAD RESULTS
  // =========================================================

  async function loadResults() {
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Result loading error:", error);
      alert(error.message);
      return;
    }

    const resultRows = (data || []) as Result[];

    // Chest No. is stored in the students table, not in results.
    // We only fetch the students that appear in the result history.
    const admissionNumbers = Array.from(
      new Set(
        resultRows
          .map((result) => result.admission_no)
          .filter(Boolean)
      )
    );

    if (admissionNumbers.length === 0) {
      setResults(resultRows);
      return;
    }

    const { data: studentsData, error: studentsError } =
      await supabase
        .from("students")
        .select("admission_no, chest_no")
        .in("admission_no", admissionNumbers);

    if (studentsError) {
      console.error("Student Chest No loading error:", studentsError);
      // Keep the results visible even if the chest-number lookup fails.
      setResults(resultRows);
      return;
    }

    const chestMap = new Map<string, string>();

    (studentsData || []).forEach((student) => {
      chestMap.set(
        String(student.admission_no),
        String(student.chest_no ?? "")
      );
    });

    const resultsWithChest = resultRows.map((result) => ({
      ...result,
      chest_no: chestMap.get(String(result.admission_no)) || "",
    }));

    setResults(resultsWithChest);
  }

  // =========================================================
  // GET SELECTED PROGRAMME
  // =========================================================

  function getSelectedProgramme() {
    return programmes.find(
      (programme) =>
        programme.id === Number(selectedProgramme)
    );
  }

  const selectedProgrammeData =
    getSelectedProgramme();

  const isGroup =
    selectedProgrammeData?.programme_type === "Group";

  // =========================================================
  // SEARCH NORMAL STUDENT
  // =========================================================

  async function searchStudent(value: string) {
    setSearch(value);

    if (!value.trim()) {
      setStudent(null);
      return;
    }

    const { data, error } = await supabase
      .from("students")
      .select(
        "admission_no, chest_no, student_name, team"
      )
      .or(
        `admission_no.eq.${value},chest_no.eq.${value}`
      )
      .maybeSingle();

    if (error) {
      console.error(error);
      setStudent(null);
      return;
    }

    setStudent(data || null);
  }

  // =========================================================
  // SEARCH PODIUM STUDENT
  // =========================================================

  async function searchPodiumStudent(
  value: string,
  position: "First" | "Second" | "Third"
) {
  if (position === "First") {
    setFirstSearch(value);
  }

  if (position === "Second") {
    setSecondSearch(value);
  }

  if (position === "Third") {
    setThirdSearch(value);
  }

  if (!value.trim()) {
    if (position === "First") {
      setFirstStudent(null);
    }

    if (position === "Second") {
      setSecondStudent(null);
    }

    if (position === "Third") {
      setThirdStudent(null);
    }

    return;
  }

  // First search by Admission No.
  let { data, error } = await supabase
    .from("students")
    .select("admission_no, chest_no, student_name, team")
    .eq("admission_no", value.trim())
    .limit(1)
    .maybeSingle();

  // If not found, search by Chest No.
  if (!data && !error) {
    const result = await supabase
      .from("students")
      .select("admission_no, chest_no, student_name, team")
      .eq("chest_no", value.trim())
      .limit(1)
      .maybeSingle();

    data = result.data;
    error = result.error;
  }

  if (error) {
    console.error("Podium student search error:", error);

    if (position === "First") {
      setFirstStudent(null);
    }

    if (position === "Second") {
      setSecondStudent(null);
    }

    if (position === "Third") {
      setThirdStudent(null);
    }

    return;
  }

  if (!data) {
    alert("Student not found. Please check the Admission No. or Chest No.");

    if (position === "First") {
      setFirstStudent(null);
    }

    if (position === "Second") {
      setSecondStudent(null);
    }

    if (position === "Third") {
      setThirdStudent(null);
    }

    return;
  }

  if (position === "First") {
    setFirstStudent(data);
  }

  if (position === "Second") {
    setSecondStudent(data);
  }

  if (position === "Third") {
    setThirdStudent(data);
  }
}

  // =========================================================
  // POINT CALCULATION
  // =========================================================

  function calculatePoints(
    programmeType: string,
    position: string
  ) {
    // Individual
    if (programmeType === "Individual") {
      if (position === "First") return 5;
      if (position === "Second") return 3;
      if (position === "Third") return 1;
    }

    // Group
    if (programmeType === "Group") {
      if (position === "First") return 10;
      if (position === "Second") return 5;
      if (position === "Third") return 3;
    }

    // General
    if (programmeType === "General") {
      if (position === "First") return 15;
      if (position === "Second") return 7;
      if (position === "Third") return 5;
    }

    return 0;
  }

  // =========================================================
  // ADD GROUP STUDENT
  // EXISTING GROUP SYSTEM - KEPT
  // =========================================================

  function addGroupStudent() {
    if (!student) {
      alert("Search for a student first.");
      return;
    }

    const programme =
      getSelectedProgramme();

    if (!programme) {
      alert("Please select a Programme ID first.");
      return;
    }

    if (programme.programme_type !== "Group") {
      alert("This is not a Group programme.");
      return;
    }

    const alreadyAdded =
      groupStudents.some(
        (item) =>
          item.admission_no ===
          student.admission_no
      );

    if (alreadyAdded) {
      alert("This student is already added.");
      return;
    }

    if (groupStudents.length > 0) {
      const existingTeam =
        groupStudents[0].team?.toUpperCase();

      const newTeam =
        student.team?.toUpperCase();

      if (existingTeam !== newTeam) {
        alert(
          `All students in a group must belong to the same team.\n\nExisting Team: ${existingTeam}\nStudent Team: ${newTeam}`
        );

        return;
      }
    }

    setGroupStudents([
      ...groupStudents,
      student,
    ]);

    setStudent(null);
    setSearch("");
  }

  // =========================================================
  // REMOVE GROUP STUDENT
  // =========================================================

  function removeGroupStudent(
    admissionNo: string
  ) {
    setGroupStudents(
      groupStudents.filter(
        (item) =>
          item.admission_no !== admissionNo
      )
    );
  }

  // =========================================================
  // SAVE 1ST + 2ND + 3RD TOGETHER
  // NEW SYSTEM
  // =========================================================

  async function saveThreePositions() {
    const programme =
      getSelectedProgramme();

    if (!programme) {
      alert("Please select a Programme.");
      return;
    }

    // IMPORTANT:
    // Group system is NOT changed.
    if (programme.programme_type === "Group") {
      alert(
        "For Group programmes, please use the existing Group Result system."
      );

      return;
    }

    if (
      !firstStudent ||
      !secondStudent ||
      !thirdStudent
    ) {
      alert(
        "Please select students for 1st, 2nd and 3rd position."
      );

      return;
    }

    // Same student cannot receive multiple positions
    const admissionNumbers = [
      firstStudent.admission_no,
      secondStudent.admission_no,
      thirdStudent.admission_no,
    ];

    if (
      new Set(admissionNumbers).size !== 3
    ) {
      alert(
        "The same student cannot be assigned to more than one position."
      );

      return;
    }

    // =======================================================
    // CHECK EXISTING RESULTS
    // =======================================================

    const { data: existing, error: existingError } =
      await supabase
        .from("results")
        .select(
          "id, position, student_name"
        )
        .eq(
          "programme_id",
          programme.id
        )
        .in("position", [
          "First",
          "Second",
          "Third",
        ]);

    if (existingError) {
      alert(existingError.message);
      return;
    }

    if (
      existing &&
      existing.length > 0
    ) {
      const existingPositions =
        existing
          .map(
            (item) =>
              `${item.position} - ${item.student_name}`
          )
          .join("\n");

      alert(
        `This programme already has result(s):\n\n${existingPositions}\n\nDelete the old result first if you need to correct it.`
      );

      return;
    }

    // =======================================================
    // PREPARE THREE RESULTS
    // =======================================================

    const rows = [
      {
        position: "First",
        student: firstStudent,
      },
      {
        position: "Second",
        student: secondStudent,
      },
      {
        position: "Third",
        student: thirdStudent,
      },
    ].map(
      ({ position, student }) => ({
        programme_id: programme.id,

        programme_name:
          programme.programme_name,

        category:
          programme.category,

        admission_no:
          student.admission_no,

        student_name:
          student.student_name,

        team:
          student.team?.toUpperCase() || "",

        position,

        points: calculatePoints(
          programme.programme_type,
          position
        ),

        published: false,

        // IMPORTANT:
        // Individual/General result.
        // Group system remains separate.
        group_result_id: null,
      })
    );

    // =======================================================
    // SAVE ALL THREE
    // =======================================================

    const { error } =
      await supabase
        .from("results")
        .insert(rows);

    if (error) {
      console.error(
        "Three-position save error:",
        error
      );

      alert(error.message);
      return;
    }

    alert(
      `✅ 1st, 2nd & 3rd Results Saved Successfully!\n\n${programme.programme_name}`
    );

    // Clear podium entry
    setFirstSearch("");
    setSecondSearch("");
    setThirdSearch("");

    setFirstStudent(null);
    setSecondStudent(null);
    setThirdStudent(null);

    await loadResults();
  }

  // =========================================================
  // SAVE EXISTING RESULT SYSTEM
  // GROUP + INDIVIDUAL + GENERAL
  // =========================================================

  async function saveResult() {
    const programme =
      getSelectedProgramme();

    if (!programme) {
      alert("Please select a Programme.");
      return;
    }

    if (!selectedPosition) {
      alert("Please select a position.");
      return;
    }

    // =======================================================
    // GROUP PROGRAMME
    // =======================================================

    if (
      programme.programme_type ===
      "Group"
    ) {
      if (groupStudents.length === 0) {
        alert(
          "Please add at least one student to the group."
        );

        return;
      }

      const {
        data: existing,
        error: duplicateError,
      } = await supabase
        .from("results")
        .select("id")
        .eq(
          "programme_id",
          programme.id
        )
        .eq(
          "position",
          selectedPosition
        )
        .limit(1);

      if (duplicateError) {
        alert(
          duplicateError.message
        );

        return;
      }

      if (
        existing &&
        existing.length > 0
      ) {
        alert(
          `${selectedPosition} is already assigned for Programme ID ${programme.id}.`
        );

        return;
      }

      const groupResultId =
        "GRP-" +
        Date.now() +
        "-" +
        Math.floor(
          Math.random() * 100000
        );

      const points =
        calculatePoints(
          programme.programme_type,
          selectedPosition
        );

      const rows =
        groupStudents.map(
          (member) => ({
            programme_id:
              programme.id,

            programme_name:
              programme.programme_name,

            category:
              programme.category,

            admission_no:
              member.admission_no,

            student_name:
              member.student_name,

            team:
              member.team
                ?.toUpperCase() || "",

            position:
              selectedPosition,

            points,

            published: false,

            group_result_id:
              groupResultId,
          })
        );

      const { error } =
        await supabase
          .from("results")
          .insert(rows);

      if (error) {
        alert(error.message);
        return;
      }

      alert(
        `✅ Group Result Saved\n\n${groupStudents.length} students added.\n${selectedPosition} — ${programme.programme_name}`
      );

      setGroupStudents([]);
      setSelectedProgramme("");
      setProgrammeSearch("");
      setSelectedPosition("");
      setSearch("");
      setStudent(null);

      await loadResults();

      return;
    }

    // =======================================================
    // INDIVIDUAL / GENERAL
    // EXISTING SINGLE RESULT SYSTEM
    // =======================================================

    if (!student) {
      alert("Please select a student.");
      return;
    }

    const points =
      calculatePoints(
        programme.programme_type,
        selectedPosition
      );

    if (points === 0) {
      alert(
        "Points could not be calculated."
      );

      return;
    }

    const {
      data: existing,
      error: duplicateError,
    } = await supabase
      .from("results")
      .select("id")
      .eq(
        "programme_id",
        programme.id
      )
      .eq(
        "position",
        selectedPosition
      )
      .limit(1);

    if (duplicateError) {
      alert(duplicateError.message);
      return;
    }

    if (
      existing &&
      existing.length > 0
    ) {
      alert(
        `${selectedPosition} is already assigned for Programme ID ${programme.id}.`
      );

      return;
    }

    const { error } =
      await supabase
        .from("results")
        .insert({
          programme_id:
            programme.id,

          programme_name:
            programme.programme_name,

          category:
            programme.category,

          admission_no:
            student.admission_no,

          student_name:
            student.student_name,

          team:
            student.team
              ?.toUpperCase() || "",

          position:
            selectedPosition,

          points,

          published: false,

          group_result_id: null,
        });

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "✅ Result Saved Successfully"
    );

    setSearch("");
    setStudent(null);
    setSelectedProgramme("");
    setProgrammeSearch("");
    setSelectedPosition("");

    await loadResults();
  }

  // =========================================================
  // DELETE RESULT
  // =========================================================

  async function deleteResult(
    id: number
  ) {
    const ok = confirm(
      "Delete this result?"
    );

    if (!ok) return;

    const { error } =
      await supabase
        .from("results")
        .delete()
        .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadResults();
  }

  // =========================================================
  // ESCAPE HTML FOR PRINT
  // =========================================================

  function escapeHtml(
    value: unknown
  ) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // =========================================================
  // PRINT PROGRAMME RESULT
  // A4 / A5
  // =========================================================

  function printProgrammeResult(
    size: "A4" | "A5"
  ) {
    const programme =
      getSelectedProgramme();

    if (!programme) {
      alert(
        "Please select a programme first."
      );

      return;
    }

    const programmeResults =
      results
        .filter(
          (result) =>
            result.programme_id ===
            programme.id
        )
        .filter(
          (result) =>
            result.position === "First" ||
            result.position === "Second" ||
            result.position === "Third"
        )
        .sort(
          (a, b) => {
            const order: Record<
              string,
              number
            > = {
              First: 1,
              Second: 2,
              Third: 3,
            };

            return (
              (order[a.position] || 99) -
              (order[b.position] || 99)
            );
          }
        );

    if (programmeResults.length === 0) {
      alert(
        "No 1st, 2nd or 3rd result has been saved for this programme yet."
      );

      return;
    }

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=900,height=700"
      );

    if (!printWindow) {
      alert(
        "Please allow pop-ups for this website."
      );

      return;
    }

    const rows =
      programmeResults
        .map(
          (result) => `
            <tr>
              <td class="position">
                ${escapeHtml(
                  result.position
                )}
              </td>

              <td>
                ${escapeHtml(
                  result.student_name
                )}
              </td>

              <td>
                ${escapeHtml(
                  result.admission_no
                )}
              </td>

              <td>
                ${escapeHtml(
                  result.chest_no || "-"
                )}
              </td>

              <td>
                ${escapeHtml(
                  result.team
                )}
              </td>
            </tr>
          `
        )
        .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Programme Result - ${size}</title>

          <style>
            @page {
              size: ${size};
              margin: 12mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              color: #111;
              background: white;
            }

            .header {
              text-align: center;
              border-bottom: 3px solid #075c2d;
              padding-bottom: 12px;
              margin-bottom: 18px;
            }

            .school {
              font-size: 20px;
              font-weight: bold;
              color: #075c2d;
              text-transform: uppercase;
            }

            .event {
              font-size: 18px;
              font-weight: bold;
              margin-top: 5px;
            }

            .title {
              font-size: 22px;
              font-weight: bold;
              margin-top: 15px;
              text-transform: uppercase;
            }

            .programme-info {
              margin: 12px 0 20px 0;
              text-align: center;
              font-size: 14px;
            }

            .programme-name {
              font-size: 18px;
              font-weight: bold;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }

            th {
              background: #075c2d;
              color: white;
              padding: 9px;
              border: 1px solid #333;
              font-size: 13px;
            }

            td {
              padding: ${size === "A5" ? "7px" : "10px"};
              border: 1px solid #333;
              font-size: ${size === "A5" ? "11px" : "13px"};
            }

            .position {
              font-weight: bold;
              text-align: center;
              width: 18%;
            }

            .footer {
              margin-top: 35px;
              text-align: right;
              font-size: 12px;
            }

            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>

        <body>

          <div class="header">
            <div class="school">
              THE GLOBAL PUBLIC SCHOOL
            </div>

            <div class="event">
              MUNAFASA 2026
            </div>

            <div class="title">
              Programme Result
            </div>
          </div>

          <div class="programme-info">

            <div class="programme-name">
              ${escapeHtml(
                programme.programme_name
              )}
            </div>

            <div>
              Programme ID:
              ${escapeHtml(
                programme.id
              )}
              &nbsp;&nbsp; | &nbsp;&nbsp;
              Category:
              ${escapeHtml(
                programme.category
              )}
            </div>

          </div>

          <table>

            <thead>
              <tr>
                <th>Position</th>
                <th>Student Name</th>
                <th>Admission No</th>
                <th>Chest No</th>
                <th>Team</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>

          </table>

          <div class="footer">
            MUNAFASA 2026
          </div>

          <script>
            window.onload = function () {
              window.focus();
              window.print();
            };
          </script>

        </body>
      </html>
    `);

    printWindow.document.close();
  }

  // =========================================================
  // FILTER PROGRAMMES
  // =========================================================

  const filteredProgrammes =
    programmes.filter(
      (programme) => {
        const searchText =
          `${programme.id} ${programme.programme_name} ${programme.category}`
            .toLowerCase();

        return searchText.includes(
          programmeSearch
            .toLowerCase()
            .trim()
        );
      }
    );

  // =========================================================
  // PROGRAMME RESULTS FOR PRINT BUTTON
  // =========================================================

  const selectedProgrammeResults =
    selectedProgrammeData
      ? results.filter(
          (result) =>
            result.programme_id ===
            selectedProgrammeData.id
        )
      : [];

  // =========================================================
  // PREVIEW GROUP STUDENTS
  // =========================================================

  const previewStudents =
    isGroup
      ? groupStudents
      : student
      ? [student]
      : [];

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <h1 className="text-4xl font-bold mb-8">
        🏆 Result Entry
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* ==================================================
            LEFT SIDE
        ================================================== */}

        <div className="bg-white shadow rounded-xl p-6">

          <h2 className="text-2xl font-bold mb-5">
            Enter Result
          </h2>

          {/* PROGRAMME */}

          <label className="font-semibold block mb-2">
            Programme
          </label>

          <input
            type="text"
            className="border border-gray-300 rounded-lg w-full p-3 mb-2"
            placeholder="Type Programme ID or Programme Name"
            value={programmeSearch}
            onChange={(e) => {
              setProgrammeSearch(
                e.target.value
              );

              if (
                selectedProgramme
              ) {
                setSelectedProgramme("");
              }
            }}
          />

          {/* SELECTED PROGRAMME */}

          {selectedProgrammeData && (
            <div className="bg-green-50 border border-green-300 rounded-lg p-3 mb-4">

              <div className="flex items-center justify-between">

                <div>

                  <p className="font-bold">
                    {
                      selectedProgrammeData.id
                    }{" "}
                    |{" "}
                    {
                      selectedProgrammeData.programme_name
                    }
                  </p>

                  <p className="text-sm text-gray-600">
                    {
                      selectedProgrammeData.category
                    }{" "}
                    |{" "}
                    {
                      selectedProgrammeData.programme_type
                    }
                  </p>

                </div>

                <button
                  type="button"
                  className="text-red-600 font-bold px-2"
                  onClick={() => {
                    setSelectedProgramme("");
                    setProgrammeSearch("");
                    setGroupStudents([]);
                    setStudent(null);
                    setSearch("");
                    setSelectedPosition("");

                    setFirstSearch("");
                    setSecondSearch("");
                    setThirdSearch("");

                    setFirstStudent(null);
                    setSecondStudent(null);
                    setThirdStudent(null);
                  }}
                >
                  ✕
                </button>

              </div>

            </div>
          )}

          {/* PROGRAMME SEARCH RESULTS */}

          {!selectedProgramme &&
            programmeSearch.trim() !== "" && (
              <div className="border rounded-lg bg-white shadow-lg max-h-64 overflow-y-auto mb-4">

                {filteredProgrammes.length ===
                0 ? (
                  <div className="p-4 text-gray-500">
                    No programme found.
                  </div>
                ) : (
                  filteredProgrammes.map(
                    (programme) => (
                      <button
                        key={
                          programme.id
                        }
                        type="button"
                        className="block w-full text-left px-4 py-3 border-b hover:bg-blue-50"
                        onClick={() => {

                          setSelectedProgramme(
                            String(
                              programme.id
                            )
                          );

                          setProgrammeSearch("");

                          setGroupStudents([]);

                          setStudent(null);
                          setSearch("");

                          setSelectedPosition("");

                          setFirstSearch("");
                          setSecondSearch("");
                          setThirdSearch("");

                          setFirstStudent(null);
                          setSecondStudent(null);
                          setThirdStudent(null);
                        }}
                      >

                        <div className="font-bold text-gray-900">

                          {programme.id}
                          {" - "}
                          {
                            programme.programme_name
                          }

                        </div>

                        <div className="text-sm text-gray-500">

                          {
                            programme.category
                          }
                          {" | "}
                          {
                            programme.programme_type
                          }

                        </div>

                      </button>
                    )
                  )
                )}

              </div>
            )}

          {/* PROGRAMME INFORMATION */}

          {selectedProgrammeData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">

              <p>
                <b>Programme ID:</b>{" "}
                {
                  selectedProgrammeData.id
                }
              </p>

              <p>
                <b>Category:</b>{" "}
                {
                  selectedProgrammeData.category
                }
              </p>

              <p>
                <b>Programme:</b>{" "}
                {
                  selectedProgrammeData.programme_name
                }
              </p>

              <p>
                <b>Type:</b>{" "}
                {
                  selectedProgrammeData.programme_type
                }
              </p>

            </div>
          )}

          {/* ==================================================
              NORMAL STUDENT / GROUP STUDENT
          ================================================== */}

          {selectedProgrammeData && (
            <>
              <label className="font-semibold block mb-2">

                {isGroup
                  ? "Add Group Student"
                  : "Student"}

              </label>

              <input
                className="border rounded-lg w-full p-3 mb-3"
                placeholder="Chest No / Admission No"
                value={search}
                onChange={(e) =>
                  searchStudent(
                    e.target.value
                  )
                }
              />

              {student && (
                <div className="bg-gray-100 rounded-lg p-4 mb-4">

                  <p>
                    <b>Name:</b>{" "}
                    {student.student_name}
                  </p>

                  <p>
                    <b>Admission No:</b>{" "}
                    {student.admission_no}
                  </p>

                  <p>
                    <b>Chest No:</b>{" "}
                    {student.chest_no}
                  </p>

                  <p>
                    <b>Team:</b>{" "}
                    {student.team}
                  </p>

                  {isGroup && (
                    <button
                      type="button"
                      onClick={
                        addGroupStudent
                      }
                      className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold"
                    >
                      ➕ Add Student
                    </button>
                  )}

                </div>
              )}

            </>
          )}

          {/* ==================================================
              GROUP STUDENTS
          ================================================== */}

          {isGroup &&
            groupStudents.length >
              0 && (

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5">

                <div className="flex justify-between items-center mb-3">

                  <h3 className="font-bold text-lg">
                    👥 Group Students
                  </h3>

                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">

                    {
                      groupStudents.length
                    }{" "}
                    Students

                  </span>

                </div>

                {groupStudents.map(
                  (
                    member,
                    index
                  ) => (

                    <div
                      key={
                        member.admission_no
                      }
                      className="flex items-center justify-between bg-white border rounded-lg p-3 mb-2"
                    >

                      <div>

                        <b>
                          {index + 1}.{" "}
                          {
                            member.student_name
                          }
                        </b>

                        <div className="text-sm text-gray-500">

                          Admission:
                          {" "}
                          {
                            member.admission_no
                          }

                          {" | "}

                          Chest:
                          {" "}
                          {
                            member.chest_no
                          }

                          {" | "}

                          Team:
                          {" "}
                          {
                            member.team
                          }

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeGroupStudent(
                            member.admission_no
                          )
                        }
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Remove
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          {/* ==================================================
              EXISTING POSITION SYSTEM
          ================================================== */}

          {isGroup && (
            <>
              <label className="font-semibold block mb-2">
                Position
              </label>

              <select
                className="border rounded-lg w-full p-3 mb-4"
                value={selectedPosition}
                onChange={(e) =>
                  setSelectedPosition(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Position
                </option>

                <option value="First">
                  🥇 First
                </option>

                <option value="Second">
                  🥈 Second
                </option>

                <option value="Third">
                  🥉 Third
                </option>

              </select>

              <button
                type="button"
                onClick={saveResult}
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg w-full font-bold"
              >
                💾 Save Group Result
              </button>
            </>
          )}

          {/* ==================================================
              NEW 1ST / 2ND / 3RD SYSTEM
          ================================================== */}

          {!isGroup &&
            selectedProgrammeData && (

              <div className="mt-8 border-2 border-purple-200 rounded-xl p-5 bg-purple-50">

                <h3 className="text-xl font-bold mb-2">
                  🏆 Enter 1st, 2nd & 3rd Results
                </h3>

                <p className="text-sm text-gray-600 mb-5">
                  Select all three position holders and save them together.
                </p>

                {/* FIRST */}

                <div className="bg-white rounded-lg p-4 mb-4 border">

                  <h4 className="font-bold text-lg mb-3">
                    🥇 First Position
                  </h4>

                 <input
  className="border rounded-lg w-full p-3"
  placeholder="Enter Chest No / Admission No"
  value={firstSearch}
  onChange={(e) => setFirstSearch(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      searchPodiumStudent(firstSearch, "First");
    }
  }}
/>

                  {firstStudent && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">

                      <p>
                        <b>Name:</b>{" "}
                        {
                          firstStudent.student_name
                        }
                      </p>

                      <p>
                        <b>Admission No:</b>{" "}
                        {
                          firstStudent.admission_no
                        }
                      </p>

                      <p>
                        <b>Chest No:</b>{" "}
                        {
                          firstStudent.chest_no
                        }
                      </p>

                      <p>
                        <b>Team:</b>{" "}
                        {
                          firstStudent.team
                        }
                      </p>

                    </div>
                  )}

                </div>

                {/* SECOND */}

                <div className="bg-white rounded-lg p-4 mb-4 border">

                  <h4 className="font-bold text-lg mb-3">
                    🥈 Second Position
                  </h4>

                  <input
  className="border rounded-lg w-full p-3"
  placeholder="Enter Chest No / Admission No"
  value={secondSearch}
  onChange={(e) => setSecondSearch(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      searchPodiumStudent(secondSearch, "Second");
    }
  }}
/>

                  {secondStudent && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">

                      <p>
                        <b>Name:</b>{" "}
                        {
                          secondStudent.student_name
                        }
                      </p>

                      <p>
                        <b>Admission No:</b>{" "}
                        {
                          secondStudent.admission_no
                        }
                      </p>

                      <p>
                        <b>Chest No:</b>{" "}
                        {
                          secondStudent.chest_no
                        }
                      </p>

                      <p>
                        <b>Team:</b>{" "}
                        {
                          secondStudent.team
                        }
                      </p>

                    </div>
                  )}

                </div>

                {/* THIRD */}

                <div className="bg-white rounded-lg p-4 mb-5 border">

                  <h4 className="font-bold text-lg mb-3">
                    🥉 Third Position
                  </h4>

                  <input
  className="border rounded-lg w-full p-3"
  placeholder="Enter Chest No / Admission No"
  value={thirdSearch}
  onChange={(e) => setThirdSearch(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      searchPodiumStudent(thirdSearch, "Third");
    }
  }}
/>

                  {thirdStudent && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">

                      <p>
                        <b>Name:</b>{" "}
                        {
                          thirdStudent.student_name
                        }
                      </p>

                      <p>
                        <b>Admission No:</b>{" "}
                        {
                          thirdStudent.admission_no
                        }
                      </p>

                      <p>
                        <b>Chest No:</b>{" "}
                        {
                          thirdStudent.chest_no
                        }
                      </p>

                      <p>
                        <b>Team:</b>{" "}
                        {
                          thirdStudent.team
                        }
                      </p>

                    </div>
                  )}

                </div>

                <button
                  type="button"
                  onClick={
                    saveThreePositions
                  }
                  className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-lg w-full font-bold"
                >
                  💾 Save 1st, 2nd & 3rd Results
                </button>

              </div>

            )}

        </div>

        {/* ==================================================
            RIGHT SIDE
        ================================================== */}

        <div className="bg-white shadow rounded-xl p-6">

          <h2 className="text-2xl font-bold mb-5">
            Live Preview
          </h2>

          {!selectedProgrammeData ? (

            <p className="text-gray-500">
              Select a programme.
            </p>

          ) : (

            <div className="space-y-3">

              <p>
                <b>Programme ID:</b>{" "}
                {
                  selectedProgrammeData.id
                }
              </p>

              <p>
                <b>Category:</b>{" "}
                {
                  selectedProgrammeData.category
                }
              </p>

              <p>
                <b>Programme:</b>{" "}
                {
                  selectedProgrammeData.programme_name
                }
              </p>

              <p>
                <b>Type:</b>{" "}
                {
                  selectedProgrammeData.programme_type
                }
              </p>

              {isGroup ? (

                <div>

                  <p className="font-bold mb-2">
                    👥 Group Students:
                  </p>

                  {previewStudents.length ===
                  0 ? (

                    <p className="text-gray-500">
                      No students added yet.
                    </p>

                  ) : (

                    previewStudents.map(
                      (
                        member,
                        index
                      ) => (

                        <p
                          key={
                            member.admission_no
                          }
                        >
                          {index + 1}.{" "}
                          {
                            member.student_name
                          }
                        </p>

                      )
                    )

                  )}

                </div>

              ) : (

                <div>

                  <p>
                    <b>1st:</b>{" "}
                    {
                      firstStudent?.student_name ||
                      "-"
                    }
                  </p>

                  <p>
                    <b>2nd:</b>{" "}
                    {
                      secondStudent?.student_name ||
                      "-"
                    }
                  </p>

                  <p>
                    <b>3rd:</b>{" "}
                    {
                      thirdStudent?.student_name ||
                      "-"
                    }
                  </p>

                </div>

              )}

              {/* ==================================================
                  PRINT BUTTONS
              ================================================== */}

              {selectedProgrammeResults.length >
                0 && (

                <div className="mt-8 border-t pt-5">

                  <h3 className="text-lg font-bold mb-2">
                    🖨️ Programme Result
                  </h3>

                  <p className="text-sm text-gray-600 mb-4">
                    Print the 1st, 2nd and 3rd position holders.
                  </p>

                  <div className="flex flex-wrap gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        printProgrammeResult(
                          "A4"
                        )
                      }
                      className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-3 rounded-lg font-bold"
                    >
                      🖨️ Print Result — A4
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        printProgrammeResult(
                          "A5"
                        )
                      }
                      className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-3 rounded-lg font-bold"
                    >
                      🖨️ Print Result — A5
                    </button>

                  </div>

                </div>

              )}

            </div>

          )}

        </div>

      </div>

      {/* ==================================================
          RESULT HISTORY
      ================================================== */}

      <div className="mt-10">

        <h2 className="text-2xl font-bold mb-5">
          Result History
        </h2>

        <div className="bg-white shadow rounded-xl overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="border p-3">
                  Programme ID
                </th>

                <th className="border p-3">
                  Category
                </th>

                <th className="border p-3">
                  Programme
                </th>

                <th className="border p-3">
                  Student
                </th>

                <th className="border p-3">
                  Admission No
                </th>

                <th className="border p-3">
                  Chest No
                </th>

                <th className="border p-3">
                  Team
                </th>

                <th className="border p-3">
                  Position
                </th>

                <th className="border p-3">
                  Points
                </th>

                <th className="border p-3">
                  Group ID
                </th>

                <th className="border p-3">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {results.map(
                (result) => (

                  <tr
                    key={result.id}
                  >

                    <td className="border p-3">
                      {
                        result.programme_id
                      }
                    </td>

                    <td className="border p-3">
                      {
                        result.category ||
                        "-"
                      }
                    </td>

                    <td className="border p-3">
                      {
                        result.programme_name
                      }
                    </td>

                    <td className="border p-3 font-semibold">
                      {
                        result.student_name
                      }
                    </td>

                    <td className="border p-3">
                      {result.admission_no}
                    </td>

                    <td className="border p-3">
                      {result.chest_no || "-"}
                    </td>

                    <td className="border p-3">
                      {result.team}
                    </td>

                    <td className="border p-3 font-bold">
                      {
                        result.position
                      }
                    </td>

                    <td className="border p-3">
                      {result.points}
                    </td>

                    <td className="border p-3 text-xs">
                      {
                        result.group_result_id ||
                        "-"
                      }
                    </td>

                    <td className="border p-3">

                      <button
                        onClick={() =>
                          deleteResult(
                            result.id
                          )
                        }
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}