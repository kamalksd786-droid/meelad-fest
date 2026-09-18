"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
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
  points: number | null;
  group_result_id: string | null;
  created_at: string;
};

type LivePoster = {
  id: number;
  image_url: string;
  student_name: string | null;
  programme_name: string | null;
  category: string | null;
  team: string | null;
  created_at: string;
};

type ResultGroup = {
  key: string;
  programme_id: number;
  programme_name: string;
  category: string | null;
  position: string;
  team: string;
  points: number;
  students: Result[];
  created_at: string;
};

type Team = {
  team: string;
  points: number;
};

type DisplayMode =
  | "current"
  | "next"
  | "result"
  | "poster"
  | "leaderboard";

export default function LiveDisplayPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [resultGroups, setResultGroups] = useState<ResultGroup[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [livePoster, setLivePoster] = useState<LivePoster | null>(null);

  const [mode, setMode] =
    useState<DisplayMode>("current");

  const [resultIndex, setResultIndex] =
    useState(0);
    const cycleStartRef = useRef(Date.now());
    const latestResultRef =
  useRef<string | null>(null);
  const seenPublishedResultsRef =
  useRef<Set<string>>(new Set());
  const latestPosterRef =
    useRef<string | null>(null);
  const [displayEventKey, setDisplayEventKey] =
    useState(0);

  const [showLeaderboard, setShowLeaderboard] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  /*
  ============================================================
  LOAD DATA
  ============================================================
  */
 

  // Refresh Supabase data every 5 seconds so schedules, results and
  // newly generated posters appear without refreshing the browser.
  useEffect(() => {
    loadAllData();

    const refresh = setInterval(() => {
      loadAllData();
    }, 5000);

    return () => clearInterval(refresh);
  }, []);

  /*
  ------------------------------------------------------------
  NORMAL 3-MINUTE ROTATION
  ------------------------------------------------------------
  Current -> Next -> Current -> Next ...

  Published results and generated posters interrupt this cycle.
  */
  useEffect(() => {
    if (mode === "result" || mode === "poster") return;

    const rotation = setTimeout(() => {
      setMode((currentMode) =>
        currentMode === "current" ? "next" : "current"
      );
    }, 180000);

    return () => clearTimeout(rotation);
  }, [mode]);

  /*
  ------------------------------------------------------------
  RESULT / POSTER = 15 SECOND INTERRUPT
  ------------------------------------------------------------
  displayEventKey makes sure a second result/poster published while
  the same interrupt is already on screen gets a fresh 15 seconds.
  */
  useEffect(() => {
    if (mode !== "result" && mode !== "poster") return;

    const interruptTimer = setTimeout(() => {
      setMode("current");
      setResultIndex(0);
    }, 15000);

    return () => clearTimeout(interruptTimer);
  }, [mode, displayEventKey]);

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
      loadLivePoster(),
      loadLeaderboard(),
      loadDisplaySettings(),
    ]);

    setLoading(false);
  }

  /*
  ============================================================
  PROGRAMMES
  ============================================================
  */

  async function loadProgrammes() {
    const { data, error } =
      await supabase
        .from("programmes")
        .select(
          "id, programme_name, category"
        )
        .order("id");

    if (error) {
      console.error(
        "Programme error:",
        error
      );

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
    const { data, error } =
      await supabase
        .from("stages")
        .select(
          "id, stage_name"
        )
        .order("id");

    if (error) {
      console.error(
        "Stage error:",
        error
      );

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
    const { data, error } =
      await supabase
        .from("schedule")
        .select("*")
        .order("programme_date")
        .order("start_time");

    if (error) {
      console.error(
        "Schedule error:",
        error
      );

      return;
    }

    setSchedules(data || []);
  }

  /*
  ============================================================
  PUBLISHED RESULTS
  ============================================================
  */

  async function loadResults() {
    const { data, error } =
      await supabase
        .from("results")
        .select("*")
        .eq("published", true)
        .order("created_at", {
          ascending: false,
        });
        

    if (error) {
      console.error(
        "Result error:",
        error
      );

      return;
    }

    const publishedResults: Result[] =
      (data || []).map((result) => ({
        ...result,
        points:
          Number(result.points) || 0,
      }));

    // Detect ANY newly published result, including an older saved
    // result that is published after another result already exists.
    const currentPublishedKeys = new Set(
      publishedResults.map((result) => String(result.id))
    );

    // If a result is unpublished, forget it so republishing it later
    // can trigger the Live Display again.
    seenPublishedResultsRef.current.forEach((key) => {
      if (!currentPublishedKeys.has(key)) {
        seenPublishedResultsRef.current.delete(key);
      }
    });

    let newlyPublishedResultKey: string | null = null;

    for (const result of publishedResults) {
      const key = String(result.id);
      if (!seenPublishedResultsRef.current.has(key)) {
        newlyPublishedResultKey = key;
        break;
      }
    }

    currentPublishedKeys.forEach((key) => {
      seenPublishedResultsRef.current.add(key);
    });

    latestResultRef.current =
      publishedResults.length > 0
        ? String(publishedResults[0].id)
        : null;

    /*
    ------------------------------------------------------------
    GROUP RESULTS

    Same group_result_id = one group result.

    Individual results = separate result.
    ------------------------------------------------------------
    */

    const groupMap =
      new Map<string, Result[]>();

    publishedResults.forEach(
      (result) => {
        const key =
          result.group_result_id ||
          `individual-${result.id}`;

        if (!groupMap.has(key)) {
          groupMap.set(key, []);
        }

        groupMap
          .get(key)!
          .push(result);
      }
    );

    const groups: ResultGroup[] =
      [];

    groupMap.forEach(
      (students, key) => {
        const first =
          students[0];

        const totalPoints =
          students.reduce(
            (total, student) =>
              total +
              (Number(
                student.points
              ) || 0),
            0
          );

        groups.push({
          key,

          programme_id:
            first.programme_id,

          programme_name:
            first.programme_name,

          category:
            first.category,

          position:
            first.position,

          team:
            first.team,

          points:
            totalPoints,

          students,

          created_at:
            first.created_at,
        });
      }
    );

    groups.sort(
      (a, b) =>
        b.created_at.localeCompare(
          a.created_at
        )
    );

    setResultGroups(groups);

    // Show the exact newly published result/group for 15 seconds.
    if (newlyPublishedResultKey !== null) {
      const newlyPublished = publishedResults.find(
        (result) => String(result.id) === newlyPublishedResultKey
      );

      if (newlyPublished) {
        const targetGroupKey =
          newlyPublished.group_result_id ||
          `individual-${newlyPublished.id}`;

        const targetIndex = groups.findIndex(
          (group) => group.key === targetGroupKey
        );

        setResultIndex(targetIndex >= 0 ? targetIndex : 0);
        setDisplayEventKey((value) => value + 1);
        setMode("result");
      }
    }

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
  LIVE POSTER
  ============================================================
  The poster designer uploads the generated PNG to the
  live-posters bucket and records it in live_display_posts.
  The newest poster interrupts the display for 15 seconds.
  */

  async function loadLivePoster() {
    const { data, error } = await supabase
      .from("live_display_posts")
      .select(
        "id, image_url, student_name, programme_name, category, team, created_at"
      )
      .eq("post_type", "poster")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Live poster error:", error);
      return;
    }

    if (!data) return;

    const poster = data as LivePoster;
    setLivePoster(poster);

    const posterKey = String(poster.id);

    // First load: remember the current poster without interrupting.
    if (latestPosterRef.current === null) {
      latestPosterRef.current = posterKey;
      return;
    }

    // A new poster was generated/published. Show it immediately.
    if (latestPosterRef.current !== posterKey) {
      latestPosterRef.current = posterKey;
      setDisplayEventKey((value) => value + 1);
      setMode("poster");
    }
  }

  /*
  ============================================================
  TEAM LEADERBOARD

  CALCULATED FROM PUBLISHED RESULTS
  ============================================================
  */

  async function loadLeaderboard() {
    const { data, error } =
      await supabase
        .from("results")
        .select(
          "team, points, published, group_result_id"
        )
        .eq("published", true);

    if (error) {
      console.error(
        "Leaderboard error:",
        error
      );

      return;
    }

    const totals: Record<
      string,
      number
    > = {};

    const countedGroups =
      new Set<string>();

    (data || []).forEach(
      (result) => {
        const team =
          String(
            result.team || ""
          )
            .trim()
            .toUpperCase();

        if (!team) {
          return;
        }

        const points =
          Number(
            result.points
          ) || 0;

        /*
        --------------------------------------------------------
        GROUP RESULT

        Count group result only once.
        --------------------------------------------------------
        */

        if (result.group_result_id) {
          const key =
            `${team}-${result.group_result_id}`;

          if (
            countedGroups.has(key)
          ) {
            return;
          }

          countedGroups.add(key);
        }

        if (!totals[team]) {
          totals[team] = 0;
        }

        totals[team] += points;
      }
    );

    const teamList: Team[] =
      Object.entries(
        totals
      )
        .map(
          ([team, points]) => ({
            team,
            points,
          })
        )
        .sort(
          (a, b) =>
            b.points - a.points
        );

    /*
    --------------------------------------------------------
    SHOW ALL FOUR MUNAFASA TEAMS
    --------------------------------------------------------
    */

    const officialTeams = [
      "DIJLA",
      "FURATH",
      "NILE",
      "SAIHOON",
    ];

    const finalTeams =
      officialTeams.map(
        (team) => ({
          team,
          points:
            totals[team] || 0,
        })
      );

    finalTeams.sort(
      (a, b) =>
        b.points - a.points
    );

    setTeams(
      finalTeams.length
        ? finalTeams
        : teamList
    );
  }

  /*
  ============================================================
  LIVE DISPLAY SETTINGS

  Admin controls:

  show_leaderboard = true
      → leaderboard appears

  show_leaderboard = false
      → leaderboard hidden
  ============================================================
  */

  async function loadDisplaySettings() {
    const { data, error } =
      await supabase
        .from(
          "live_display_settings"
        )
        .select(
          "show_leaderboard"
        )
        .eq("id", 1)
        .maybeSingle();

    if (error) {
      console.error(
        "Display settings error:",
        error
      );

      return;
    }

    setShowLeaderboard(
      Boolean(
        data?.show_leaderboard
      )
    );
  }

  /*
  ============================================================
  HELPERS
  ============================================================
  */

  function getProgramme(
    programmeId: number
  ) {
    return programmes.find(
      (programme) =>
        programme.id ===
        programmeId
    );
  }

  function getPositionEmoji(
    position: string
  ) {
    const value =
      position
        ?.trim()
        .toLowerCase();

    if (value === "first") {
      return "🥇";
    }

    if (value === "second") {
      return "🥈";
    }

    if (value === "third") {
      return "🥉";
    }

    return "🏆";
  }

  /*
  ============================================================
  CURRENT PROGRAMMES

  DATABASE STATUS = Running
  ============================================================
  */

  function getCurrentSchedules() {
    return stages
      .map((stage) => {
        const schedule =
          schedules.find(
            (item) =>
              item.stage_id ===
                stage.id &&
              item.status ===
                "Running"
          );

        return {
          stage,
          schedule:
            schedule || null,
        };
      })
      .filter(
        (item) =>
          item.schedule !== null
      );
  }

  /*
  ============================================================
  NEXT PROGRAMMES
  ============================================================
  */

  function getNextSchedules() {
    return stages
      .map((stage) => {
        const upcoming =
          schedules
            .filter(
              (item) =>
                item.stage_id ===
                  stage.id &&
                item.status ===
                  "Scheduled"
            )
            .sort((a, b) => {
              const aValue =
                `${a.programme_date} ${a.start_time}`;

              const bValue =
                `${b.programme_date} ${b.start_time}`;

              return aValue.localeCompare(
                bValue
              );
            });

        return {
          stage,
          schedule:
            upcoming[0] || null,
        };
      })
      .filter(
        (item) =>
          item.schedule !== null
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

  const currentSchedules =
    getCurrentSchedules();

  const nextSchedules =
    getNextSchedules();

  /*
  ============================================================
  CURRENT PROGRAMMES
  ============================================================
  */

  if (mode === "current") {
    return (
      <main className="min-h-screen bg-black text-white px-8 py-8">

        <Header
          title="CURRENT PROGRAMMES"
        />

        {currentSchedules.length ===
        0 ? (
          <EmptyMessage
            text="No programmes are currently running."
          />
        ) : (
          <StageGrid
            items={currentSchedules}
            getProgramme={
              getProgramme
            }
            type="current"
          />
        )}

        <RotationFooter
          text="Next: Upcoming Programmes"
        />

      </main>
    );
  }

  /*
  ============================================================
  NEXT PROGRAMMES
  ============================================================
  */

  if (mode === "next") {
    return (
      <main className="min-h-screen bg-black text-white px-8 py-8">

        <Header
          title="NEXT PROGRAMMES"
        />

        {nextSchedules.length ===
        0 ? (
          <EmptyMessage
            text="No upcoming programmes scheduled."
          />
        ) : (
          <StageGrid
            items={nextSchedules}
            getProgramme={
              getProgramme
            }
            type="next"
          />
        )}

        <RotationFooter
          text="Next: Published Results"
        />

      </main>
    );
  }

  /*
  ============================================================
  GENERATED POSTER
  ============================================================
  */

  if (mode === "poster") {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-6">
        <div className="relative w-full h-[calc(100vh-90px)] flex items-center justify-center">
          {livePoster?.image_url ? (
            <img
              src={livePoster.image_url}
              alt={livePoster.student_name || "MUNAFASA poster"}
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
            />
          ) : (
            <div className="text-4xl font-bold">
              MUNAFASA 2026
            </div>
          )}

          {(livePoster?.student_name || livePoster?.programme_name) && (
            <div className="absolute bottom-4 left-4 right-4 text-center bg-black/70 rounded-xl px-5 py-3">
              {livePoster.student_name && (
                <div className="text-2xl md:text-4xl font-extrabold">
                  {livePoster.student_name}
                </div>
              )}
              {livePoster.programme_name && (
                <div className="text-lg md:text-2xl text-gray-300 mt-1">
                  {livePoster.programme_name}
                </div>
              )}
            </div>
          )}
        </div>

        <RotationFooter text="Next: Current Programmes" />
      </main>
    );
  }

  /*
  ============================================================
  PUBLISHED RESULTS
  ============================================================
  */

  if (mode === "result") {
    if (
      resultGroups.length ===
      0
    ) {
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

          <RotationFooter
            text={
              showLeaderboard
                ? "Next: Team Leaderboard"
                : "Next: Current Programmes"
            }
          />

        </main>
      );
    }

    const result =
      resultGroups[
        resultIndex
      ] ||
      resultGroups[0];

    const isGroup =
      result.students.length >
      1;

    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-8 py-8">

        {/* TROPHY */}

        <div className="text-6xl md:text-8xl">
          🏆
        </div>

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
          {getPositionEmoji(
            result.position
          )}
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

              {result.students.map(
                (student) => (
                  <div
                    key={student.id}
                    className="bg-gray-900 border border-gray-700 rounded-2xl p-5 text-center"
                  >

                    <div className="text-2xl md:text-3xl font-bold">
                      {
                        student.student_name
                      }
                    </div>

                    {student.admission_no && (
                      <div className="text-gray-500 text-sm mt-2">
                        Admission No:{" "}
                        {
                          student.admission_no
                        }
                      </div>
                    )}

                  </div>
                )
              )}

            </div>

            <div className="text-center text-3xl md:text-5xl font-extrabold text-green-400 mt-7">
              {result.team}
            </div>

          </div>
        ) : (

          /* INDIVIDUAL RESULT */

          <div className="text-center mt-6">

            <div className="text-4xl md:text-6xl lg:text-7xl font-extrabold">
              {
                result.students[0]
                  .student_name
              }
            </div>

            <div className="text-3xl md:text-5xl font-extrabold text-green-400 mt-4">
              {result.team}
            </div>

            {result.students[0]
              .admission_no && (
              <div className="text-gray-500 text-lg mt-3">
                Admission No:{" "}
                {
                  result
                    .students[0]
                    .admission_no
                }
              </div>
            )}

          </div>
        )}

        <RotationFooter
          text={
            resultIndex +
              1 <
            resultGroups.length
              ? "Next: Another Published Result"
              : showLeaderboard
              ? "Next: Team Leaderboard"
              : "Next: Current Programmes"
          }
        />

      </main>
    );
  }

  /*
  ============================================================
  TEAM LEADERBOARD
  ============================================================
  */

  if (
    mode === "leaderboard"
  ) {

    /*
    If Admin switches leaderboard
    OFF while display is running,
    immediately return to current.
    */

    if (!showLeaderboard) {
      return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center">

          <div className="text-4xl font-bold">
            MUNAFASA 2026
          </div>

        </main>
      );
    }

    return (
      <main className="min-h-screen bg-black text-white px-8 py-8">

        <div className="text-center mb-12">

          <div className="text-6xl md:text-8xl">
            🏆
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mt-3">
            MUNAFASA 2026
          </h1>

          <p className="text-3xl md:text-5xl text-yellow-400 font-bold mt-4">
            TEAM LEADERBOARD
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">

          {teams.map(
            (team, index) => {

              const medal =
                index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : "🏅";

              return (
                <div
                  key={team.team}
                  className="bg-gray-900 border border-gray-700 rounded-3xl p-10 text-center"
                >

                  <div className="text-7xl">
                    {medal}
                  </div>

                  <div className="text-3xl md:text-4xl font-extrabold mt-5">
                    {team.team}
                  </div>

                  <div className="text-6xl md:text-7xl font-extrabold text-yellow-400 mt-6">
                    {team.points}
                  </div>

                  <div className="text-xl text-gray-400 mt-2">
                    POINTS
                  </div>

                </div>
              );
            }
          )}

        </div>

        <RotationFooter
          text="Next: Current Programmes"
        />

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

      {items.map(
        ({
          stage,
          schedule,
        }) => {

          if (!schedule) {
            return null;
          }

          const programme =
            getProgramme(
              schedule.programme_id
            );

          return (
            <div
              key={stage.id}
              className={`rounded-2xl p-8 border ${
                type === "current"
                  ? "bg-green-950 border-green-700"
                  : "bg-gray-900 border-gray-700"
              }`}
            >

              <div className="flex justify-between items-center">

                <div className="text-xl md:text-2xl font-bold">
                  🎤{" "}
                  {stage.stage_name}
                </div>

                {type ===
                  "current" && (
                  <div className="bg-green-500 text-black px-4 py-2 rounded-full text-sm font-bold">
                    LIVE
                  </div>
                )}

              </div>

              <div className="text-sm text-gray-400 mt-6">
                PROGRAMME ID
              </div>

              <div className="text-2xl font-bold text-blue-400">
                {
                  schedule.programme_id
                }
              </div>

              <div className="text-2xl md:text-3xl font-extrabold mt-4">
                {
                  programme?.programme_name ||
                  "Programme"
                }
              </div>

              {programme?.category && (
                <div className="text-lg md:text-xl text-gray-400 mt-2">
                  Category:{" "}
                  {
                    programme.category
                  }
                </div>
              )}

              <div className="text-xl md:text-2xl font-semibold mt-5">
                ⏰{" "}
                {
                  schedule.start_time
                }{" "}
                –{" "}
                {
                  schedule.end_time
                }
              </div>

            </div>
          );
        }
      )}

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
      🔄 Current / Next: 3 minutes • Result / Poster: 15 seconds •{" "}
      {text}
    </div>
  );
}