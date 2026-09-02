"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";

type Team = {
  id: number;
  team_name: string;
  points: number;
};

type Result = {
  id: number;
  team: string;
  points: number;
  category: string | null;
  admission_no: string;
  student_name: string;
  group_result_id: string | null;
};

type Student = {
  admission_no: string;
  gender: string | null;
};

type StudentChampion = {
  category: string;
  student: string;
  team: string;
  points: number;
};

type CategoryChampion = {
  category: string;
  team: string;
  points: number;
};

const CATEGORIES = [
  "Kiddies",
  "Sub-junior",
  "Junior",
  "Senior",
];

export default function LeaderboardPage() {
  const [teams, setTeams] = useState<Team[]>([]);

  const [boysChampions, setBoysChampions] =
    useState<StudentChampion[]>([]);

  const [girlsChampions, setGirlsChampions] =
    useState<StudentChampion[]>([]);

  const [categoryChampions, setCategoryChampions] =
    useState<CategoryChampion[]>([]);

  const [loading, setLoading] = useState(true);

  // ==================================================
  // LIVE DISPLAY LEADERBOARD CONTROL
  // ==================================================

  const [showLeaderboard, setShowLeaderboard] =
    useState(false);

  const [updatingDisplay, setUpdatingDisplay] =
    useState(false);

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadLeaderboard();
    loadDisplaySetting();

    const interval = setInterval(() => {
      loadLeaderboard();
      loadDisplaySetting();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ==================================================
  // LOAD LIVE DISPLAY SETTING
  // ==================================================

  async function loadDisplaySetting() {
    const { data, error } = await supabase
      .from("live_display_settings")
      .select("show_leaderboard")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error(
        "Live display setting error:",
        error
      );
      return;
    }

    if (data) {
      setShowLeaderboard(
        Boolean(data.show_leaderboard)
      );
    }
  }

  // ==================================================
  // TOGGLE LIVE DISPLAY LEADERBOARD
  // ==================================================

  async function toggleLeaderboardDisplay() {
    if (updatingDisplay) return;

    const newValue = !showLeaderboard;

    setUpdatingDisplay(true);

    const { error } = await supabase
      .from("live_display_settings")
      .update({
        show_leaderboard: newValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      console.error(
        "Live display update error:",
        error
      );

      alert(
        "Could not update Live Display setting.\n\n" +
          error.message
      );

      setUpdatingDisplay(false);
      return;
    }

    setShowLeaderboard(newValue);
    setUpdatingDisplay(false);
  }

  // ==================================================
  // LOAD LEADERBOARD
  // ==================================================

  async function loadLeaderboard() {
    setLoading(true);

    // ==================================================
    // LOAD TEAMS
    // ==================================================

    const { data: teamData, error: teamError } =
      await supabase
        .from("teams")
        .select("*")
        .order("team_name");

    if (teamError) {
      console.error(
        "Team loading error:",
        teamError
      );

      setLoading(false);
      return;
    }

    // ==================================================
    // LOAD ALL RESULTS
    //
    // IMPORTANT:
    // Leaderboard counts entered results even when
    // published = false.
    // ==================================================

    const { data: resultData, error: resultError } =
      await supabase
        .from("results")
        .select(
          "id, team, points, category, admission_no, student_name, group_result_id"
        )
        .order("id", { ascending: false });

    if (resultError) {
      console.error(
        "Result loading error:",
        resultError
      );

      setLoading(false);
      return;
    }

    const results: Result[] =
      (resultData || []).map((result) => ({
        id: result.id,
        team: result.team || "",
        points: Number(result.points) || 0,
        category: result.category || null,
        admission_no:
          result.admission_no || "",
        student_name:
          result.student_name || "",
        group_result_id:
          result.group_result_id || null,
      }));

    // ==================================================
    // LOAD STUDENT GENDER
    // ==================================================

    const admissionNumbers = [
      ...new Set(
        results
          .map(
            (result) =>
              result.admission_no
          )
          .filter(Boolean)
      ),
    ];

    let students: Student[] = [];

    if (admissionNumbers.length > 0) {
      const {
        data: studentData,
        error: studentError,
      } = await supabase
        .from("students")
        .select(
          "admission_no, gender"
        )
        .in(
          "admission_no",
          admissionNumbers
        );

      if (studentError) {
        console.error(
          "Student gender loading error:",
          studentError
        );
      } else {
        students = studentData || [];
      }
    }

    const genderMap = new Map<
      string,
      string
    >();

    students.forEach((student) => {
      genderMap.set(
        String(
          student.admission_no
        ),
        (student.gender || "")
          .trim()
          .toLowerCase()
      );
    });

    // ==================================================
    // 1. OVERALL TEAM LEADERBOARD
    //
    // Individual + Group
    // Group result counted only once.
    // ==================================================

    const countedOverallGroups =
      new Set<string>();

    const teamsWithPoints: Team[] = (
      teamData || []
    ).map((team) => {
      const teamName =
        team.team_name
          .trim()
          .toUpperCase();

      let totalPoints = 0;

      results.forEach((result) => {
        const resultTeam =
          result.team
            .trim()
            .toUpperCase();

        if (
          resultTeam !== teamName
        ) {
          return;
        }

        if (
          result.group_result_id
        ) {
          const groupKey =
            `${teamName}-${result.group_result_id}`;

          if (
            countedOverallGroups.has(
              groupKey
            )
          ) {
            return;
          }

          countedOverallGroups.add(
            groupKey
          );

          totalPoints +=
            result.points;

          return;
        }

        totalPoints +=
          result.points;
      });

      return {
        ...team,
        points: totalPoints,
      };
    });

    teamsWithPoints.sort(
      (a, b) =>
        b.points - a.points
    );

    setTeams(teamsWithPoints);

    // ==================================================
    // 2. BOYS & GIRLS CATEGORY CHAMPIONS
    //
    // INDIVIDUAL RESULTS ONLY.
    //
    // group_result_id must be null.
    // Highest individual points wins.
    // ==================================================

    const boys: StudentChampion[] =
      [];

    const girls: StudentChampion[] =
      [];

    CATEGORIES.forEach(
      (category) => {
        const categoryResults =
          results.filter(
            (result) =>
              (
                result.category ||
                ""
              )
                .trim()
                .toLowerCase() ===
                category.toLowerCase() &&
              !result.group_result_id
          );

        const boysResults =
          categoryResults.filter(
            (result) => {
              const gender =
                genderMap.get(
                  String(
                    result.admission_no
                  )
                );

              return (
                gender === "boy" ||
                gender === "boys" ||
                gender === "male"
              );
            }
          );

        const girlsResults =
          categoryResults.filter(
            (result) => {
              const gender =
                genderMap.get(
                  String(
                    result.admission_no
                  )
                );

              return (
                gender === "girl" ||
                gender === "girls" ||
                gender === "female"
              );
            }
          );

        // ==================================================
        // BOYS
        // ==================================================

        boysResults.sort(
          (a, b) =>
            b.points - a.points
        );

        if (
          boysResults.length > 0
        ) {
          const winner =
            boysResults[0];

          boys.push({
            category,
            student:
              winner.student_name,
            team: winner.team,
            points:
              winner.points,
          });
        } else {
          boys.push({
            category,
            student:
              "No results yet",
            team: "",
            points: 0,
          });
        }

        // ==================================================
        // GIRLS
        // ==================================================

        girlsResults.sort(
          (a, b) =>
            b.points - a.points
        );

        if (
          girlsResults.length > 0
        ) {
          const winner =
            girlsResults[0];

          girls.push({
            category,
            student:
              winner.student_name,
            team: winner.team,
            points:
              winner.points,
          });
        } else {
          girls.push({
            category,
            student:
              "No results yet",
            team: "",
            points: 0,
          });
        }
      }
    );

    setBoysChampions(boys);
    setGirlsChampions(girls);

    // ==================================================
    // 3. CATEGORY TEAM CHAMPIONS
    //
    // Individual + Group points.
    // Group counted only once.
    // ==================================================

    const categoryPoints: Record<
      string,
      Record<string, number>
    > = {};

    const countedCategoryGroups =
      new Set<string>();

    results.forEach((result) => {
      const category = (
        result.category || ""
      ).trim();

      const team =
        result.team
          .trim()
          .toUpperCase();

      if (
        !category ||
        !team
      ) {
        return;
      }

      const matchedCategory =
        CATEGORIES.find(
          (item) =>
            item.toLowerCase() ===
            category.toLowerCase()
        );

      if (!matchedCategory) {
        return;
      }

      if (
        !categoryPoints[
          matchedCategory
        ]
      ) {
        categoryPoints[
          matchedCategory
        ] = {};
      }

      if (
        result.group_result_id
      ) {
        const groupKey =
          `${matchedCategory}-${team}-${result.group_result_id}`;

        if (
          countedCategoryGroups.has(
            groupKey
          )
        ) {
          return;
        }

        countedCategoryGroups.add(
          groupKey
        );
      }

      if (
        !categoryPoints[
          matchedCategory
        ][team]
      ) {
        categoryPoints[
          matchedCategory
        ][team] = 0;
      }

      categoryPoints[
        matchedCategory
      ][team] += result.points;
    });

    const calculatedChampions:
      CategoryChampion[] = [];

    CATEGORIES.forEach(
      (category) => {
        const teamsInCategory =
          categoryPoints[
            category
          ] || {};

        const entries =
          Object.entries(
            teamsInCategory
          );

        if (
          entries.length === 0
        ) {
          calculatedChampions.push({
            category,
            team:
              "No results yet",
            points: 0,
          });

          return;
        }

        entries.sort(
          (a, b) =>
            b[1] - a[1]
        );

        const [
          winningTeam,
          winningPoints,
        ] = entries[0];

        calculatedChampions.push({
          category,
          team: winningTeam,
          points:
            winningPoints,
        });
      }
    );

    setCategoryChampions(
      calculatedChampions
    );

    setLoading(false);
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <DashboardLayout>
      {/* HEADER */}

      <div className="mb-6">

        <h1 className="text-4xl font-bold">
          🏆 Live Leaderboard
        </h1>

        <p className="text-gray-500 mt-2">
          Team Rankings
        </p>

      </div>

      {/* ==================================================
          LIVE DISPLAY CONTROL
      ================================================== */}

      <div
        className={`mb-8 rounded-2xl border-2 p-6 shadow-lg ${
          showLeaderboard
            ? "bg-green-50 border-green-400"
            : "bg-gray-50 border-gray-300"
        }`}
      >

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>

            <h2 className="text-2xl font-bold">
              📺 Live Display
            </h2>

            <p className="text-gray-600 mt-2">
              Control whether the Team
              Leaderboard appears on the
              public Live Display.
            </p>

            <p className="mt-3 font-bold">
              Status:{" "}

              {showLeaderboard ? (
                <span className="text-green-700">
                  🟢 VISIBLE ON LIVE DISPLAY
                </span>
              ) : (
                <span className="text-red-600">
                  🔴 HIDDEN FROM LIVE DISPLAY
                </span>
              )}

            </p>

          </div>

          <button
            type="button"
            onClick={
              toggleLeaderboardDisplay
            }
            disabled={updatingDisplay}
            className={`px-7 py-4 rounded-xl text-white font-bold text-lg shadow-md transition ${
              showLeaderboard
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } ${
              updatingDisplay
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >

            {updatingDisplay
              ? "Updating..."
              : showLeaderboard
              ? "🔴 HIDE FROM LIVE DISPLAY"
              : "🟢 SHOW ON LIVE DISPLAY"}

          </button>

        </div>

      </div>

      {/* ==================================================
          LEADERBOARD
      ================================================== */}

      {loading ? (

        <div className="text-center text-xl text-gray-500">
          Loading leaderboard...
        </div>

      ) : (

        <>

          {/* ==================================================
              OVERALL TEAM LEADERBOARD
          ================================================== */}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

            {teams.map(
              (team, index) => (

                <div
                  key={team.id}
                  className="bg-white rounded-2xl shadow-xl p-8 text-center"
                >

                  <div className="text-5xl mb-4">

                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : "🏅"}

                  </div>

                  <h2 className="text-2xl font-bold">
                    {team.team_name}
                  </h2>

                  <p className="text-5xl font-bold text-blue-700 mt-6">
                    {team.points}
                  </p>

                  <p className="text-gray-500">
                    Points
                  </p>

                </div>

              )
            )}

          </div>

          {/* ==================================================
              BOYS CATEGORY CHAMPIONS
          ================================================== */}

          <div className="mt-12">

            <div className="mb-6">

              <h2 className="text-3xl font-bold">
                👦 Boys Category Champions
              </h2>

              <p className="text-gray-500 mt-2">
                Highest individual scorer in each category
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              {boysChampions.map(
                (champion) => (

                  <div
                    key={
                      champion.category
                    }
                    className="bg-white rounded-2xl shadow-lg p-6 text-center border"
                  >

                    <div className="text-4xl mb-3">
                      🏆
                    </div>

                    <h3 className="text-xl font-bold">
                      {champion.category}
                    </h3>

                    {champion.student ===
                    "No results yet" ? (

                      <p className="text-gray-400 mt-5">
                        No results yet
                      </p>

                    ) : (

                      <div className="mt-5">

                        <p className="text-sm text-gray-500">
                          Boys Champion
                        </p>

                        <p className="text-xl font-bold text-blue-700 mt-2">
                          {champion.student}
                        </p>

                        <p className="text-sm text-gray-500 mt-2">
                          Team:{" "}
                          {champion.team}
                        </p>

                        <p className="text-lg font-bold mt-1">
                          {champion.points}{" "}
                          Points
                        </p>

                      </div>

                    )}

                  </div>

                )
              )}

            </div>

          </div>

          {/* ==================================================
              GIRLS CATEGORY CHAMPIONS
          ================================================== */}

          <div className="mt-12">

            <div className="mb-6">

              <h2 className="text-3xl font-bold">
                👧 Girls Category Champions
              </h2>

              <p className="text-gray-500 mt-2">
                Highest individual scorer in each category
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              {girlsChampions.map(
                (champion) => (

                  <div
                    key={
                      champion.category
                    }
                    className="bg-white rounded-2xl shadow-lg p-6 text-center border"
                  >

                    <div className="text-4xl mb-3">
                      🏆
                    </div>

                    <h3 className="text-xl font-bold">
                      {champion.category}
                    </h3>

                    {champion.student ===
                    "No results yet" ? (

                      <p className="text-gray-400 mt-5">
                        No results yet
                      </p>

                    ) : (

                      <div className="mt-5">

                        <p className="text-sm text-gray-500">
                          Girls Champion
                        </p>

                        <p className="text-xl font-bold text-pink-700 mt-2">
                          {champion.student}
                        </p>

                        <p className="text-sm text-gray-500 mt-2">
                          Team:{" "}
                          {champion.team}
                        </p>

                        <p className="text-lg font-bold mt-1">
                          {champion.points}{" "}
                          Points
                        </p>

                      </div>

                    )}

                  </div>

                )
              )}

            </div>

          </div>

          {/* ==================================================
              CATEGORY TEAM CHAMPIONS
          ================================================== */}

          <div className="mt-12">

            <div className="mb-6">

              <h2 className="text-3xl font-bold">
                🏆 Category Team Champions
              </h2>

              <p className="text-gray-500 mt-2">
                Highest team points in each category
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              {categoryChampions.map(
                (champion) => (

                  <div
                    key={
                      champion.category
                    }
                    className="bg-white rounded-2xl shadow-lg p-6 text-center border"
                  >

                    <div className="text-4xl mb-3">
                      🏆
                    </div>

                    <h3 className="text-xl font-bold">
                      {champion.category}
                    </h3>

                    {champion.team ===
                    "No results yet" ? (

                      <p className="text-gray-400 mt-5">
                        No results yet
                      </p>

                    ) : (

                      <div className="mt-5">

                        <p className="text-sm text-gray-500">
                          Category Team Champion
                        </p>

                        <p className="text-2xl font-bold text-green-700 mt-2">
                          {champion.team}
                        </p>

                        <p className="text-gray-500 mt-1">
                          {champion.points}{" "}
                          Points
                        </p>

                      </div>

                    )}

                  </div>

                )
              )}

            </div>

          </div>

        </>

      )}

    </DashboardLayout>
  );
}