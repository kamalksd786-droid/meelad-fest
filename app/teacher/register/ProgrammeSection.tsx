"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  student: any;
  teacherId: string;
  onRegistered: () => void;
}

const CATEGORY_LIMITS: Record<
  string,
  {
    stage: number;
    offStage: number;
    group: number;
    general: number;
  }
> = {
  kiddies: {
    stage: 2,
    offStage: 2,
    group: 1,
    general: 0,
  },

  "sub-junior": {
    stage: 4,
    offStage: 3,
    group: 1,
    general: 1,
  },

  junior: {
    stage: 6,
    offStage: 5,
    group: 1,
    general: 1,
  },

  senior: {
    stage: 7,
    offStage: 9,
    group: 1,
    general: 1,
  },
};
export default function ProgrammeSection({
  student,
  teacherId,
  onRegistered,
}: Props) {
  const [stageProgrammes, setStageProgrammes] = useState<any[]>([]);
  const [offStageProgrammes, setOffStageProgrammes] = useState<any[]>([]);
  const [groupProgrammes, setGroupProgrammes] = useState<any[]>([]);
  const [generalProgrammes, setGeneralProgrammes] = useState<any[]>([]);

  const [selectedProgrammes, setSelectedProgrammes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!student) {
      clearProgrammes();
      setSelectedProgrammes([]);
      return;
    }

    loadProgrammes();
  }, [student]);

  function clearProgrammes() {
    setStageProgrammes([]);
    setOffStageProgrammes([]);
    setGroupProgrammes([]);
    setGeneralProgrammes([]);
  }
function normalizeCategory(category: string) {
  return category
    ?.trim()
    .toLowerCase();
}
  async function loadProgrammes() {
  clearProgrammes();
  setSelectedProgrammes([]);

  if (!student?.category) return;

  // -----------------------------
  // STUDENT CATEGORY
  // -----------------------------

  const studentCategory =
    student.category.trim().toLowerCase();

  let programmeCategory = "";

  if (studentCategory === "kiddies") {
    programmeCategory = "Kiddies";
  } else if (
    studentCategory === "sub junior" ||
    studentCategory === "sub-junior" ||
    studentCategory === "subjunior"
  ) {
    programmeCategory = "Sub-junior";
  } else if (studentCategory === "junior") {
    programmeCategory = "Junior";
  } else if (studentCategory === "senior") {
    programmeCategory = "Senior";
  }

  if (!programmeCategory) {
    console.log(
      "Unknown student category:",
      student.category
    );
    return;
  }

  // -----------------------------
  // STUDENT GENDER
  // -----------------------------

  const rawGender =
    String(student.gender || "")
      .trim()
      .toLowerCase();

  let studentGender = "";

  if (
    rawGender === "boy" ||
    rawGender === "boys" ||
    rawGender === "male"
  ) {
    studentGender = "Boys";
  } else if (
    rawGender === "girl" ||
    rawGender === "girls" ||
    rawGender === "female"
  ) {
    studentGender = "Girls";
  }

  console.log("Student category:", student.category);
  console.log("Programme category:", programmeCategory);
  console.log("Student gender:", student.gender);
  console.log("Programme gender:", studentGender);

  // -----------------------------
  // LOAD CATEGORY + GENERAL
  // -----------------------------

  const { data, error } = await supabase
    .from("programmes")
    .select("*")
    .in("category", [
      programmeCategory,
      "General",
    ])
    .order("programme_name");

  if (error) {
    console.error(
      "Programme loading error:",
      error
    );

    alert(error.message);
    return;
  }

  // -----------------------------
  // GENDER FILTER
  // -----------------------------

  const eligibleProgrammes = (data || []).filter(
    (programme) => {

      const programmeGender =
        String(programme.gender || "")
          .trim()
          .toLowerCase();

      // Common programmes are available
      // for both boys and girls.
      if (programmeGender === "common") {
        return true;
      }

      // Boys programme
      if (
        programmeGender === "boys" &&
        studentGender === "Boys"
      ) {
        return true;
      }

      // Girls programme
      if (
        programmeGender === "girls" &&
        studentGender === "Girls"
      ) {
        return true;
      }

      return false;
    }
  );

  console.log(
    "Total eligible programmes:",
    eligibleProgrammes.length
  );

  // -----------------------------
  // STAGE
  // -----------------------------

  setStageProgrammes(
    eligibleProgrammes.filter(
      (p) =>
        p.programme_type === "Individual" &&
        p.event_type === "Stage"
    )
  );

  // -----------------------------
  // OFF STAGE
  // -----------------------------

  setOffStageProgrammes(
    eligibleProgrammes.filter(
      (p) =>
        p.programme_type === "Individual" &&
        p.event_type === "Off Stage"
    )
  );

  // -----------------------------
  // GROUP
  // -----------------------------

  setGroupProgrammes(
    eligibleProgrammes.filter(
      (p) =>
        p.programme_type === "Group"
    )
  );

  // -----------------------------
  // GENERAL
  // -----------------------------

  setGeneralProgrammes(
    eligibleProgrammes.filter(
      (p) =>
        p.programme_type === "General"
    )
  );
}
  function getLimits() {
  const category =
    student?.category
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

  if (category === "kiddies") {
    return CATEGORY_LIMITS.kiddies;
  }

  if (
    category === "sub-junior" ||
    category === "subjunior"
  ) {
    return CATEGORY_LIMITS["sub-junior"];
  }

  if (category === "junior") {
    return CATEGORY_LIMITS.junior;
  }

  if (category === "senior") {
    return CATEGORY_LIMITS.senior;
  }

  return {
    stage: 0,
    offStage: 0,
    group: 0,
    general: 0,
  };
}

  function getSection(programme: any) {
    if (programme.programme_type === "Group") {
      return "group";
    }

    if (programme.programme_type === "General") {
      return "general";
    }

    if (
      programme.programme_type === "Individual" &&
      programme.event_type === "Stage"
    ) {
      return "stage";
    }

    if (
      programme.programme_type === "Individual" &&
      programme.event_type === "Off Stage"
    ) {
      return "offStage";
    }

    return null;
  }

  function getSelectedCount(section: string) {
    return selectedProgrammes.filter(
      (programme) => getSection(programme) === section
    ).length;
  }

  function toggleProgramme(programme: any) {
    const alreadySelected = selectedProgrammes.some(
      (p) => p.id === programme.id
    );

    // Remove programme
    if (alreadySelected) {
      setSelectedProgrammes(
        selectedProgrammes.filter(
          (p) => p.id !== programme.id
        )
      );
      return;
    }

    const section = getSection(programme);

    if (!section) return;

    const limits = getLimits();

    const limit =
      limits[section as keyof typeof limits];

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
        `${student.category} students can select maximum ${limit} programme(s) from ${sectionName}.`
      );

      return;
    }

    setSelectedProgrammes([
      ...selectedProgrammes,
      programme,
    ]);
  }

  async function registerSelectedProgrammes() {
    if (!student) {
      alert("Please select a student.");
      return;
    }

    if (selectedProgrammes.length === 0) {
      alert("Please select at least one programme.");
      return;
    }

    if (!teacherId) {
      alert("Teacher session not found.");
      return;
    }

    setLoading(true);

    let registeredCount = 0;
    let duplicateCount = 0;

    for (const programme of selectedProgrammes) {
      const { data: existing, error: checkError } =
        await supabase
          .from("registrations")
          .select("id")
          .eq("admission_no", student.admission_no)
          .eq("programme_id", programme.id)
          .maybeSingle();

      if (checkError) {
        setLoading(false);
        alert(checkError.message);
        return;
      }

      if (existing) {
        duplicateCount++;
        continue;
      }

      const { error } = await supabase
        .from("registrations")
        .insert({
          teacher_id: teacherId,
          admission_no: student.admission_no,
          student_name: student.student_name,
          chest_no: student.chest_no,
          category: student.category,
          team: student.team,
          programme_id: programme.id,
          programme_name: programme.programme_name,
          programme_type: programme.programme_type,
        });

      if (error) {
        setLoading(false);
        alert(error.message);
        return;
      }

      registeredCount++;
    }

    setLoading(false);

    alert(
      `✅ Registered: ${registeredCount}\n` +
      `Already Registered: ${duplicateCount}`
    );

    setSelectedProgrammes([]);

    onRegistered();
  }

  function ProgrammeButton({
    programme,
  }: {
    programme: any;
  }) {
    const selected = selectedProgrammes.some(
      (p) => p.id === programme.id
    );

    return (
      <button
        type="button"
        onClick={() => toggleProgramme(programme)}
        className={`w-full text-left p-4 rounded-xl border-2 transition ${
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
  }

  function ProgrammeList({
    programmes,
  }: {
    programmes: any[];
  }) {
    if (programmes.length === 0) {
      return (
        <p className="text-gray-500 text-sm">
          No programmes available.
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {programmes.map((programme) => (
          <ProgrammeButton
            key={programme.id}
            programme={programme}
          />
        ))}
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const limits = getLimits();

  const stageCount = getSelectedCount("stage");
  const offStageCount = getSelectedCount("offStage");
  const groupCount = getSelectedCount("group");
  const generalCount = getSelectedCount("general");

  return (
    <div className="mt-8 space-y-6">

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
          programmes={offStageProgrammes}
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
          programmes={groupProgrammes}
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
          programmes={generalProgrammes}
        />
      </section>

      {/* SELECTED PROGRAMMES */}

      {selectedProgrammes.length > 0 && (
        <section className="bg-green-50 border-2 border-green-600 rounded-2xl p-6">

          <h2 className="text-xl font-bold text-green-800">
            Selected Programmes
          </h2>

          <p className="text-gray-600 mt-1">
            {selectedProgrammes.length} programme(s) selected
          </p>

          <div className="mt-4 space-y-2">
            {selectedProgrammes.map(
              (programme) => (
                <div
                  key={programme.id}
                  className="bg-white rounded-lg p-3 border flex justify-between items-center"
                >
                  <span className="font-semibold">
                    {programme.programme_name}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      toggleProgramme(programme)
                    }
                    className="text-red-600 font-bold px-3"
                  >
                    ✕
                  </button>
                </div>
              )
            )}
          </div>

          <button
            type="button"
            onClick={registerSelectedProgrammes}
            disabled={loading}
            className="mt-6 w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white py-4 rounded-xl text-lg font-bold"
          >
            {loading
              ? "Registering..."
              : `✅ Register ${selectedProgrammes.length} Programme(s)`}
          </button>

        </section>
      )}

    </div>
  );
}