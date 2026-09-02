"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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

export default function ParentProgrammePage() {
  const router = useRouter();

  const [student, setStudent] = useState<any>(null);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [selectedProgrammes, setSelectedProgrammes] = useState<any[]>([]);
  const [registeredProgrammes, setRegisteredProgrammes] =
    useState<any[]>([]);

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const [confirmationNo, setConfirmationNo] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD STUDENT FROM PARENT PORTAL
  // --------------------------------------------------

  useEffect(() => {
    async function loadStudent() {
      const savedStudent =
        localStorage.getItem("parentStudent");

      if (!savedStudent) {
        router.push("/parent");
        return;
      }

      try {
        const studentData = JSON.parse(savedStudent);

        if (!studentData?.admission_no) {
          localStorage.removeItem("parentStudent");
          router.push("/parent");
          return;
        }

        setStudent(studentData);

        const category = normalizeCategory(
          studentData.category
        );

        const gender = String(
          studentData.gender || ""
        )
          .trim()
          .toLowerCase();

        let genderValues: string[] = ["Common"];

        if (
          gender === "boys" ||
          gender === "boy"
        ) {
          genderValues = ["Common", "Boys"];
        }

        if (
          gender === "girls" ||
          gender === "girl"
        ) {
          genderValues = ["Common", "Girls"];
        }

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
          setError(programmeError.message);
          setLoading(false);
          return;
        }

        setProgrammes(programmeData || []);
        setLoading(false);
      } catch (error) {
        console.error(error);

        localStorage.removeItem("parentStudent");

        router.push("/parent");
      }
    }

    loadStudent();
  }, [router]);

  // --------------------------------------------------
  // GET SECTION
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
  // GET SELECTED COUNT
  // --------------------------------------------------

  function getSelectedCount(section: string) {
    return selectedProgrammes.filter(
      (programme) =>
        getSection(programme) === section
    ).length;
  }

  // --------------------------------------------------
  // TOGGLE PROGRAMME
  // --------------------------------------------------

  function toggleProgramme(programme: any) {
    const alreadySelected =
      selectedProgrammes.some(
        (p) => p.id === programme.id
      );

    if (alreadySelected) {
      setSelectedProgrammes(
        selectedProgrammes.filter(
          (p) => p.id !== programme.id
        )
      );

      return;
    }

    const section = getSection(programme);

    if (!section) {
      return;
    }

    const category = normalizeCategory(
      student?.category
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
  // REGISTER PROGRAMMES
  // --------------------------------------------------

  async function registerProgrammes() {
    if (!student) {
      alert("Student information not found.");
      return;
    }

    if (selectedProgrammes.length === 0) {
      alert(
        "Please select at least one programme."
      );
      return;
    }

    setSaving(true);
    // --------------------------------------------------
// CHECK EXISTING REGISTRATIONS AGAINST CATEGORY LIMITS
// --------------------------------------------------

const {
  data: existingRegistrations,
  error: existingError,
} = await supabase
  .from("registrations")
  .select("id, programme_id")
  .eq("admission_no", student.admission_no);

if (existingError) {
  console.error(existingError);
  alert(existingError.message);
  setSaving(false);
  return;
}

// Get the programme details for already registered programmes
const existingProgrammeIds =
  (existingRegistrations || [])
    .map((r) => r.programme_id)
    .filter(Boolean);

let existingProgrammeData: any[] = [];

if (existingProgrammeIds.length > 0) {
  const {
    data,
    error: existingProgrammeError,
  } = await supabase
    .from("programmes")
    .select("*")
    .in("id", existingProgrammeIds);

  if (existingProgrammeError) {
    console.error(existingProgrammeError);
    alert(existingProgrammeError.message);
    setSaving(false);
    return;
  }

  existingProgrammeData = data || [];
}

// Count already registered programmes by section
const existingCounts = {
  stage: 0,
  offStage: 0,
  group: 0,
  general: 0,
};

existingProgrammeData.forEach((programme) => {
  const section = getSection(programme);

  if (
    section === "stage" ||
    section === "offStage" ||
    section === "group" ||
    section === "general"
  ) {
    existingCounts[section]++;
  }
});

// Check selected programmes against existing registrations
const selectedCounts = {
  stage: 0,
  offStage: 0,
  group: 0,
  general: 0,
};

selectedProgrammes.forEach((programme) => {
  const section = getSection(programme);

  if (
    section === "stage" ||
    section === "offStage" ||
    section === "group" ||
    section === "general"
  ) {
    selectedCounts[section]++;
  }
});

// Check limits
const sectionNames: Record<string, string> = {
  stage: "Stage",
  offStage: "Off Stage",
  group: "Group",
  general: "General",
};

const sectionLimits = {
  stage: limits?.stage || 0,
  offStage: limits?.offStage || 0,
  group: limits?.group || 0,
  general: limits?.general || 0,
};

for (const section of [
  "stage",
  "offStage",
  "group",
  "general",
] as const) {
  const total =
    existingCounts[section] + selectedCounts[section];

  if (total > sectionLimits[section]) {
    alert(
      `${category} students can register maximum ${sectionLimits[section]} programme(s) from ${sectionNames[section]}. You already have ${existingCounts[section]} registered.`
    );

    setSaving(false);
    return;
  }
}
    const successfullyRegistered: any[] = [];

    for (const programme of selectedProgrammes) {
      // Check duplicate registration
      const {
        data: existing,
        error: checkError,
      } = await supabase
        .from("registrations")
        .select("id")
        .eq(
          "admission_no",
          student.admission_no
        )
        .eq(
          "programme_id",
          programme.id
        )
        .maybeSingle();

      if (checkError) {
        console.error(checkError);
        alert(checkError.message);
        setSaving(false);
        return;
      }

      // Already registered
      if (existing) {
        successfullyRegistered.push(
          programme
        );
        continue;
      }

      // Insert registration
      const {
        error: insertError,
      } = await supabase
        .from("registrations")
        .insert({
          admission_no:
            student.admission_no,

          student_name:
            student.student_name,

          chest_no:
            student.chest_no,

          category:
            student.category,

          team:
            student.team,

          programme_id:
            programme.id,

          programme_name:
            programme.programme_name,

          programme_type:
            programme.programme_type,
        });

      if (insertError) {
        console.error(insertError);
        alert(insertError.message);
        setSaving(false);
        return;
      }

      successfullyRegistered.push(
        programme
      );
    }

    // Confirmation number
    const confirmation =
      `MNF-2026-${student.admission_no}-${Date.now()
        .toString()
        .slice(-6)}`;

    setConfirmationNo(confirmation);

    setRegisteredProgrammes(
      successfullyRegistered
    );

    setSelectedProgrammes([]);

    setShowConfirmation(true);

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
        {programmes.map((programme) => {
          const selected =
            selectedProgrammes.some(
              (p) => p.id === programme.id
            );

          return (
            <button
              key={programme.id}
              type="button"
              onClick={() =>
                toggleProgramme(programme)
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
                  {selected && "✓"}
                </div>

                <span className="font-semibold">
                  {programme.programme_name}
                </span>

              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // --------------------------------------------------
  // FILTER PROGRAMMES
  // --------------------------------------------------

  const stageProgrammes =
    programmes.filter(
      (p) => getSection(p) === "stage"
    );

  const offStageProgrammes =
    programmes.filter(
      (p) => getSection(p) === "offStage"
    );

  const groupProgrammes =
    programmes.filter(
      (p) => getSection(p) === "group"
    );

  const generalProgrammes =
    programmes.filter(
      (p) => getSection(p) === "general"
    );

  const category = student
    ? normalizeCategory(student.category)
    : "";

  const limits = category
    ? CATEGORY_LIMITS[category]
    : null;

  const stageCount =
    getSelectedCount("stage");

  const offStageCount =
    getSelectedCount("offStage");

  const groupCount =
    getSelectedCount("group");

  const generalCount =
    getSelectedCount("general");

  // --------------------------------------------------
  // PRINT POSTER
  // --------------------------------------------------

  function printConfirmation() {
    window.print();
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">

        <div className="bg-white rounded-2xl shadow-lg p-10 text-center">

          <div className="text-4xl mb-4">
            🔍
          </div>

          <h2 className="text-2xl font-bold">
            Loading Student...
          </h2>

          <p className="text-gray-500 mt-2">
            Please wait.
          </p>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="bg-purple-800 text-white p-5 shadow print:hidden">

        <h1 className="text-3xl font-bold">
          MUNAFASA 2026
        </h1>

        <p>
          Parent Programme Registration
        </p>

      </div>

      <div className="max-w-7xl mx-auto p-6">

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-xl p-5 mb-6">
            {error}
          </div>
        )}

        {/* STUDENT DETAILS */}

        {student && !showConfirmation && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">

            <div className="flex justify-between items-start">

              <div>
                <h2 className="text-2xl font-bold mb-5">
                  👨‍🎓 Student Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/parent")
                }
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold print:hidden"
              >
                ← Change Student
              </button>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-5">

              <div>
                <p className="text-gray-500 text-sm">
                  Student
                </p>

                <p className="font-bold">
                  {student.student_name}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Admission
                </p>

                <p className="font-bold">
                  {student.admission_no}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Class
                </p>

                <p className="font-bold">
                  {student.class}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Category
                </p>

                <p className="font-bold">
                  {category}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Gender
                </p>

                <p className="font-bold">
                  {student.gender}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Team
                </p>

                <p className="font-bold">
                  {student.team}
                </p>
              </div>

            </div>

          </div>
        )}

        {/* PROGRAMMES */}

        {student &&
          limits &&
          !showConfirmation && (
            <div className="space-y-6">

              {/* STAGE */}

              <section className="bg-white rounded-2xl shadow-lg p-6">

                <div className="flex justify-between items-center mb-5">

                  <h2 className="text-2xl font-bold text-green-700">
                    🎤 Stage
                  </h2>

                  <span className="font-bold text-green-700">
                    {stageCount} / {limits.stage}
                  </span>

                </div>

                <ProgrammeList
                  programmes={stageProgrammes}
                />

              </section>

              {/* OFF STAGE */}

              <section className="bg-white rounded-2xl shadow-lg p-6">

                <div className="flex justify-between items-center mb-5">

                  <h2 className="text-2xl font-bold text-orange-600">
                    📝 Off Stage
                  </h2>

                  <span className="font-bold text-orange-600">
                    {offStageCount} / {limits.offStage}
                  </span>

                </div>

                <ProgrammeList
                  programmes={
                    offStageProgrammes
                  }
                />

              </section>

              {/* GROUP */}

              <section className="bg-white rounded-2xl shadow-lg p-6">

                <div className="flex justify-between items-center mb-5">

                  <h2 className="text-2xl font-bold text-blue-700">
                    👥 Group
                  </h2>

                  <span className="font-bold text-blue-700">
                    {groupCount} / {limits.group}
                  </span>

                </div>

                <ProgrammeList
                  programmes={
                    groupProgrammes
                  }
                />

              </section>

              {/* GENERAL */}

              <section className="bg-white rounded-2xl shadow-lg p-6">

                <div className="flex justify-between items-center mb-5">

                  <h2 className="text-2xl font-bold text-purple-700">
                    🏆 General
                  </h2>

                  <span className="font-bold text-purple-700">
                    {generalCount} / {limits.general}
                  </span>

                </div>

                <ProgrammeList
                  programmes={
                    generalProgrammes
                  }
                />

              </section>

              {/* REGISTER */}

              <div className="text-center pb-10">

                <button
                  type="button"
                  onClick={registerProgrammes}
                  disabled={
                    saving ||
                    selectedProgrammes.length === 0
                  }
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-10 py-4 rounded-xl font-bold text-lg"
                >
                  {saving
                    ? "Registering..."
                    : "💾 Register Selected Programmes"}
                </button>

              </div>

            </div>
          )}

        {/* ================================================= */}
        {/* CONFIRMATION POSTER */}
        {/* ================================================= */}

        {showConfirmation &&
          student && (
            <div className="mt-4">

              {/* BUTTONS */}

              <div className="flex justify-center gap-4 mb-6 print:hidden">

                <button
                  type="button"
                  onClick={printConfirmation}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
                >
                  🖨 Print / Save PDF
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmation(false);
                    setRegisteredProgrammes([]);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold"
                >
                  ← Back
                </button>

              </div>

              {/* POSTER */}

              <div
  id="registration-confirmation"
  className="bg-white max-w-3xl mx-auto shadow-2xl border-4 border-purple-800 p-8 print-poster"
>

                {/* POSTER HEADER */}

                <div className="text-center border-b-2 border-purple-800 pb-5">

                  <h1 className="text-4xl font-extrabold text-purple-800">
                    MUNAFASA 2026
                  </h1>

                  <p className="text-xl font-bold mt-2">
                    THE GLOBAL PUBLIC SHOOL 
                  </p>

                  <p className="text-lg font-semibold text-gray-600 mt-1">
                    PROGRAMME REGISTRATION
                  </p>

                  <p className="text-sm font-semibold text-gray-500">
                    CONFIRMATION
                  </p>

                </div>

                {/* CONFIRMATION NUMBER */}

                <div className="text-center mt-5">

                  <span className="inline-block bg-purple-100 text-purple-800 px-5 py-2 rounded-lg font-bold">
                    Confirmation No:{" "}
                    {confirmationNo}
                  </span>

                </div>

                {/* STUDENT DETAILS */}

                <div className="mt-6 border rounded-xl p-5">

                  <h2 className="text-xl font-bold text-purple-800 mb-4">
                    👨‍🎓 Student Details
                  </h2>

                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <p className="text-gray-500 text-sm">
                        Student Name
                      </p>

                      <p className="font-bold">
                        {student.student_name}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm">
                        Admission No
                      </p>

                      <p className="font-bold">
                        {student.admission_no}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm">
                        Class
                      </p>

                      <p className="font-bold">
                        {student.class}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm">
                        Category
                      </p>

                      <p className="font-bold">
                        {category}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm">
                        Gender
                      </p>

                      <p className="font-bold">
                        {student.gender}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm">
                        Team
                      </p>

                      <p className="font-bold">
                        {student.team}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm">
                        Registration Date
                      </p>

                      <p className="font-bold">
                        {new Date().toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                  </div>

                </div>

                {/* REGISTERED PROGRAMMES */}

                <div className="mt-6">

                  <h2 className="text-xl font-bold text-purple-800 mb-4">
                    📋 Registered Programmes
                  </h2>

                  {/* STAGE */}

                  {registeredProgrammes.filter(
                    (p) =>
                      getSection(p) ===
                      "stage"
                  ).length > 0 && (
                    <div className="mb-5">

                      <h3 className="text-lg font-bold text-green-700 border-b pb-2">
                        🎤 STAGE
                      </h3>

                      <ul className="mt-2 space-y-2">

                        {registeredProgrammes
                          .filter(
                            (p) =>
                              getSection(p) ===
                              "stage"
                          )
                          .map((p) => (
                            <li
                              key={p.id}
                              className="border rounded-lg px-4 py-2 font-semibold"
                            >
                              {p.programme_name}
                            </li>
                          ))}

                      </ul>

                    </div>
                  )}

                  {/* OFF STAGE */}

                  {registeredProgrammes.filter(
                    (p) =>
                      getSection(p) ===
                      "offStage"
                  ).length > 0 && (
                    <div className="mb-5">

                      <h3 className="text-lg font-bold text-orange-600 border-b pb-2">
                        📝 OFF STAGE
                      </h3>

                      <ul className="mt-2 space-y-2">

                        {registeredProgrammes
                          .filter(
                            (p) =>
                              getSection(p) ===
                              "offStage"
                          )
                          .map((p) => (
                            <li
                              key={p.id}
                              className="border rounded-lg px-4 py-2 font-semibold"
                            >
                              {p.programme_name}
                            </li>
                          ))}

                      </ul>

                    </div>
                  )}

                  {/* GROUP */}

                  {registeredProgrammes.filter(
                    (p) =>
                      getSection(p) ===
                      "group"
                  ).length > 0 && (
                    <div className="mb-5">

                      <h3 className="text-lg font-bold text-blue-700 border-b pb-2">
                        👥 GROUP
                      </h3>

                      <ul className="mt-2 space-y-2">

                        {registeredProgrammes
                          .filter(
                            (p) =>
                              getSection(p) ===
                              "group"
                          )
                          .map((p) => (
                            <li
                              key={p.id}
                              className="border rounded-lg px-4 py-2 font-semibold"
                            >
                              {p.programme_name}
                            </li>
                          ))}

                      </ul>

                    </div>
                  )}

                  {/* GENERAL */}

                  {registeredProgrammes.filter(
                    (p) =>
                      getSection(p) ===
                      "general"
                  ).length > 0 && (
                    <div className="mb-5">

                      <h3 className="text-lg font-bold text-purple-700 border-b pb-2">
                        🏆 GENERAL
                      </h3>

                      <ul className="mt-2 space-y-2">

                        {registeredProgrammes
                          .filter(
                            (p) =>
                              getSection(p) ===
                              "general"
                          )
                          .map((p) => (
                            <li
                              key={p.id}
                              className="border rounded-lg px-4 py-2 font-semibold"
                            >
                              {p.programme_name}
                            </li>
                          ))}

                      </ul>

                    </div>
                  )}

                </div>

                {/* FOOTER */}

                <div className="border-t-2 border-purple-800 mt-6 pt-5 text-center">

                  <p className="font-bold text-lg">
                    MUNAFASA 2026
                  </p>

                  <p className="text-gray-600">
                    THE GLOBAL PUBLIC SHOOL 
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Please keep this confirmation
                    for your records.
                  </p>

                </div>

              </div>

            </div>
          )}

      </div>
<style jsx global>{`
  @media print {
    @page {
      size: A4 portrait;
      margin: 8mm;
    }

    body {
      background: white !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    body * {
      visibility: hidden !important;
    }

    #registration-confirmation,
    #registration-confirmation * {
      visibility: visible !important;
    }

    #registration-confirmation {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 10px !important;
      box-shadow: none !important;
      border-width: 2px !important;
      font-size: 11px !important;
    }

    #registration-confirmation h1 {
      font-size: 24px !important;
      margin: 0 !important;
    }

    #registration-confirmation h2 {
      font-size: 15px !important;
      margin-top: 8px !important;
      margin-bottom: 6px !important;
    }

    #registration-confirmation h3 {
      font-size: 13px !important;
      padding-bottom: 3px !important;
    }

    #registration-confirmation .mt-6 {
      margin-top: 8px !important;
    }

    #registration-confirmation .mt-5 {
      margin-top: 6px !important;
    }

    #registration-confirmation .mb-5 {
      margin-bottom: 6px !important;
    }

    #registration-confirmation .mb-4 {
      margin-bottom: 4px !important;
    }

    #registration-confirmation .p-5 {
      padding: 8px !important;
    }

    #registration-confirmation .py-2 {
      padding-top: 3px !important;
      padding-bottom: 3px !important;
    }

    #registration-confirmation .space-y-2 > :not([hidden]) ~ :not([hidden]) {
      margin-top: 3px !important;
    }

    #registration-confirmation li {
      padding-top: 3px !important;
      padding-bottom: 3px !important;
    }
  }
`}</style>
    </div>
    
  );
}