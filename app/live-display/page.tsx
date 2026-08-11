"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Programme = {
  id: number;
  programme_name: string;
  category: string | null;
};

type Stage = {
  id: number;
  stage_name: string;
};

type Schedule = {
  id: number;
  programme_id: number;
  stage_id: number;
  programme_date: string;
  start_time: string;
  end_time: string;
  status: string;
};

type Result = {
  id: number;
  programme_id: number;
  programme_name: string;
  category: string | null;
  admission_no: string | null;
  student_name: string;
  team: string;
  position: string;
  group_result_id: string | null;
  created_at: string;
};

type ResultGroup = {
  key: string;
  programme_id: number;
  programme_name: string;
  category: string | null;
  position: string;
  team: string;
  students: Result[];
  created_at: string;
};

type DisplayMode = "current" | "next" | "result";

export default function LiveDisplayPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [resultGroups, setResultGroups] = useState<ResultGroup[]>([]);

  const [mode, setMode] = useState<DisplayMode>("current");
  const [resultIndex, setResultIndex] = useState(0);

  const [loading, setLoading] = useState(true);

  /*
  ============================================================
  LOAD DATA
  ============================================================
  */

  useEffect(() => {
    loadAllData();

    const refresh = setInterval(() => {
      loadAllData();
    }, 5000);

    return () => clearInterval(refresh);
  }, []);

  /*
  ============================================================
  30 SECOND ROTATION

  CURRENT
      ↓ 30 sec
  NEXT
      ↓ 30 sec
  RESULT
      ↓ 30 sec
  RESULT
      ↓
  CURRENT
  ============================================================
  */

  useEffect(() => {
    const rotation = setInterval(() => {
      setMode((currentMode) => {
        if (currentMode === "current") {
          return "next";
        }

        if (currentMode === "next") {
          if (resultGroups.length > 0) {
            setResultIndex(0);
            return "result";
          }

          return "current";
        }

        if (resultGroups.length === 0) {
          return "current";
        }

        if (resultIndex + 1 < resultGroups.length) {
          setResultIndex((previous) => previous + 1);
          return "result";
        }

        setResultIndex(0);

        return "current";
      });
    }, 30000);

    return () => clearInterval(rotation);
  }, [resultGroups.length, resultIndex]);

  /*
  ============================================================
  LOAD EVERYTHING
  ============================================================
  */

  async function loadAllData() {
    await Promise.all([
      loadProgrammes(),
      loadStages(),
      loadSchedules(),
      loadResults(),
    ]);

    setLoading(false);
  }

  /*
  ============================================================
  PROGRAMMES
  ============================================================
  */

  async function loadProgrammes() {
    const { data, error } = await supabase
      .from("programmes")
      .select("id, programme_name, category")
      .order("id");

    if (error) {
      console.error("Programme error:", error);
      return;
    }

    setProgrammes(data || []);
  }

  /*
  ============================================================
  STAGES
  ============================================================
  */

  async function loadStages() {
    const { data, error } = await supabase
      .from("stages")
      .select("id, stage_name")
      .order("id");

    if (error) {
      console.error("Stage error:", error);
      return;
    }

    setStages(data || []);
  }

  /*
  ============================================================
  SCHEDULE
  ============================================================
  */

  async function loadSchedules() {
    const { data, error } = await supabase
      .from("schedule")
      .select("*")
      .order("programme_date")
      .order("start_time");

    if (error) {
      console.error("Schedule error:", error);
      return;
    }

    setSchedules(data || []);
  }

  /*
  ============================================================
  RESULTS
  ============================================================
  */

  async function loadResults() {
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Result error:", error);
      return;
    }

    const publishedResults: Result[] = data || [];

    /*
    GROUP RESULTS

    Same group_result_id = one group result.

    Individual results get their own key.
    */

    const groupMap = new Map<string, Result[]>();

    publishedResults.forEach((result) => {
      const key =
        result.group_result_id ||
        `individual-${result.id}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }

      groupMap.get(key)!.push(result);
    });

    const groups: ResultGroup[] = [];

    groupMap.forEach((students, key) => {
      const first = students[0];

      groups.push({
        key,
        programme_id: first.programme_id,
        programme_name: first.programme_name,
        category: first.category,
        position: first.position,
        team: first.team,
        students,
        created_at: first.created_at,
      });
    });

    groups.sort((a, b) =>
      b.created_at.localeCompare(a.created_at)
    );

    setResultGroups(groups);

    setResultIndex((current) => {
      if (groups.length === 0) {
        return 0;
      }

      if (current >= groups.length) {
        return 0;
      }

      return current;
    });
  }

  /*
  ============================================================
  HELPERS
  ============================================================
  */

  function getProgramme(programmeId: number) {
    return programmes.find(
      (programme) => programme.id === programmeId
    );
  }

  function getPositionEmoji(position: string) {
    if (position === "First") return "🥇";
    if (position === "Second") return "🥈";
    if (position === "Third") return "🥉";

    return "🏆";
  }

  /*
  ============================================================
  CURRENT PROGRAMMES

  IMPORTANT:
  USE DATABASE STATUS = Running

  NOT CLOCK TIME
  ============================================================
  */

  function getCurrentSchedules() {
    return stages
      .map((stage) => {
        const schedule = schedules.find(
          (item) =>
            item.stage_id === stage.id &&
            item.status === "Running"
        );

        return {
          stage,
          schedule: schedule || null,
        };
      })
      .filter(
        (item) => item.schedule !== null
      );
  }

  /*
  ============================================================
  NEXT PROGRAMMES

  Scheduled programmes only.
  ============================================================
  */

  function getNextSchedules() {
    return stages
      .map((stage) => {
        const upcoming = schedules
          .filter(
            (item) =>
              item.stage_id === stage.id &&
              item.status === "Scheduled"
          )
          .sort((a, b) => {
            const aValue =
              `${a.programme_date} ${a.start_time}`;

            const bValue =
              `${b.programme_date} ${b.start_time}`;

            return aValue.localeCompare(bValue);
          });

        return {
          stage,
          schedule: upcoming[0] || null,
        };
      })
      .filter(
        (item) => item.schedule !== null
      );
  }

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-4xl font-bold">
          Loading MUNAFASA 2026...
        </div>
      </main>
    );
  }

  const currentSchedules = getCurrentSchedules();
  const nextSchedules = getNextSchedules();

  /*
  ============================================================
  CURRENT SCREEN
  ============================================================
  */

  if (mode === "current") {
    return (
      <main className="min-h-screen bg-black text-white px-8 py-8">

        <Header title="CURRENT PROGRAMMES" />

        {currentSchedules.length === 0 ? (
          <EmptyMessage text="No programmes are currently running." />
        ) : (
          <StageGrid
            items={currentSchedules}
            getProgramme={getProgramme}
            type="current"
          />
        )}

        <RotationFooter text="Next: Upcoming Programmes" />

      </main>
    );
  }

  /*
  ============================================================
  NEXT SCREEN
  ============================================================
  */

  if (mode === "next") {
    return (
      <main className="min-h-screen bg-black text-white px-8 py-8">

        <Header title="NEXT PROGRAMMES" />

        {nextSchedules.length === 0 ? (
          <EmptyMessage text="No upcoming programmes scheduled." />
        ) : (
          <StageGrid
            items={nextSchedules}
            getProgramme={getProgramme}
            type="next"
          />
        )}

        <RotationFooter text="Next: Published Results" />

      </main>
    );
  }

  /*
  ============================================================
  RESULT SCREEN
  ============================================================
  */

  if (mode === "result") {

    if (resultGroups.length === 0) {
      return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

          <div className="text-7xl">
            🏆
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mt-5">
            MUNAFASA 2026
          </h1>

          <p className="text-2xl text-gray-400 mt-5">
            No published results yet.
          </p>

        </main>
      );
    }

    const result =
      resultGroups[resultIndex] ||
      resultGroups[0];

    const isGroup =
      result.students.length > 1;

    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-8 py-8">

        {/* TROPHY */}

        <div className="text-6xl md:text-8xl">
          🏆
        </div>

        {/* EVENT */}

        <h1 className="text-4xl md:text-6xl font-extrabold mt-3 text-center">
          MUNAFASA 2026
        </h1>

        {/* CATEGORY */}

        {result.category && (
          <div className="text-2xl md:text-4xl text-gray-400 font-bold mt-3">
            {result.category}
          </div>
        )}

        {/* PROGRAMME */}

        <h2 className="text-3xl md:text-6xl lg:text-7xl text-green-400 font-extrabold text-center mt-4">
          {result.programme_name}
        </h2>

        {/* POSITION */}

        <div className="text-6xl md:text-8xl mt-5">
          {getPositionEmoji(result.position)}
        </div>

        <div className="text-4xl md:text-6xl font-extrabold mt-2">
          {result.position}
        </div>

        {/* GROUP RESULT */}

        {isGroup ? (

          <div className="w-full max-w-6xl mt-6">

            <div className="text-center text-xl md:text-2xl text-gray-400 font-semibold mb-5">
              GROUP RESULT
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {result.students.map((student) => (

                <div
                  key={student.id}
                  className="bg-gray-900 border border-gray-700 rounded-2xl p-5 text-center"
                >

                  <div className="text-2xl md:text-3xl font-bold">
                    {student.student_name}
                  </div>

                  {student.admission_no && (
                    <div className="text-gray-500 text-sm mt-2">
                      Admission No: {student.admission_no}
                    </div>
                  )}

                </div>

              ))}

            </div>

            <div className="text-center text-3xl md:text-5xl font-extrabold text-green-400 mt-7">
              {result.team}
            </div>

          </div>

        ) : (

          /* INDIVIDUAL RESULT */

          <div className="text-center mt-6">

            <div className="text-4xl md:text-6xl lg:text-7xl font-extrabold">
              {result.students[0].student_name}
            </div>

            <div className="text-3xl md:text-5xl font-extrabold text-green-400 mt-4">
              {result.team}
            </div>

            {result.students[0].admission_no && (
              <div className="text-gray-500 text-lg mt-3">
                Admission No:{" "}
                {result.students[0].admission_no}
              </div>
            )}

          </div>

        )}

        {/* NO POINTS */}

        <RotationFooter text="Next: Current Programmes" />

      </main>
    );
  }

  return null;
}


/*
============================================================
HEADER
============================================================
*/

function Header({
  title,
}: {
  title: string;
}) {

  return (
    <div className="text-center mb-10">

      <div className="text-5xl md:text-6xl">
        🏆
      </div>

      <h1 className="text-4xl md:text-6xl font-extrabold mt-2">
        MUNAFASA 2026
      </h1>

      <p className="text-2xl md:text-4xl text-gray-400 font-bold mt-3">
        {title}
      </p>

    </div>
  );
}


/*
============================================================
STAGE GRID
============================================================
*/

function StageGrid({
  items,
  getProgramme,
  type,
}: {
  items: {
    stage: Stage;
    schedule: Schedule | null;
  }[];

  getProgramme: (
    programmeId: number
  ) => Programme | undefined;

  type: "current" | "next";
}) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">

      {items.map(({ stage, schedule }) => {

        if (!schedule) return null;

        const programme =
          getProgramme(schedule.programme_id);

        return (

          <div
            key={stage.id}
            className={`rounded-2xl p-6 border ${
              type === "current"
                ? "bg-green-950 border-green-700"
                : "bg-gray-900 border-gray-700"
            }`}
          >

            {/* STAGE */}

            <div className="flex justify-between items-center">

              <div className="text-xl md:text-2xl font-bold">
                🎤 {stage.stage_name}
              </div>

              {type === "current" && (
                <div className="bg-green-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                  LIVE
                </div>
              )}

            </div>

            {/* PROGRAMME ID */}

            <div className="text-sm text-gray-400 mt-5">
              Programme ID
            </div>

            <div className="text-xl font-bold text-blue-400">
              {schedule.programme_id}
            </div>

            {/* PROGRAMME */}

            <div className="text-2xl md:text-3xl font-extrabold mt-3">
              {programme?.programme_name || "Programme"}
            </div>

            {/* CATEGORY */}

            {programme?.category && (
              <div className="text-lg md:text-xl text-gray-400 mt-2">
                Category: {programme.category}
              </div>
            )}

            {/* TIME */}

            <div className="text-xl md:text-2xl font-semibold mt-4">
              ⏰ {schedule.start_time} – {schedule.end_time}
            </div>

          </div>

        );
      })}

    </div>
  );
}


/*
============================================================
EMPTY MESSAGE
============================================================
*/

function EmptyMessage({
  text,
}: {
  text: string;
}) {

  return (
    <div className="h-[60vh] flex items-center justify-center">

      <div className="text-2xl md:text-4xl text-gray-500 text-center">
        {text}
      </div>

    </div>
  );
}


/*
============================================================
ROTATION FOOTER
============================================================
*/

function RotationFooter({
  text,
}: {
  text: string;
}) {

  return (
    <div className="fixed bottom-4 left-0 right-0 text-center text-gray-600 text-sm">
      🔄 Changes automatically every 30 seconds • {text}
    </div>
  );
}