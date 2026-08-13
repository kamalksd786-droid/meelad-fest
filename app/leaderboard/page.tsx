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
  team: string;
  points: number;
  category: string | null;
  group_result_id: string | null;
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
  const [champions, setChampions] = useState<
    CategoryChampion[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();

    const interval = setInterval(() => {
      loadLeaderboard();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function loadLeaderboard() {
    setLoading(true);

    // ------------------------------------------
    // LOAD TEAMS
    // ------------------------------------------

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

    // ------------------------------------------
    // LOAD ONLY PUBLISHED RESULTS
    // ------------------------------------------

    const { data: resultData, error: resultError } =
  await supabase
    .from("results")
    .select(
      "team, points, category, group_result_id, published"
    )
    .eq("published", true);

console.log("PUBLISHED RESULTS:", resultData);
    if (resultError) {
      console.error(
        "Result loading error:",
        resultError
      );
      setLoading(false);
      return;
    }

   const results: Result[] = (resultData || []).map((result) => ({
  team: result.team || "",
  points: Number(result.points) || 0,
  category: result.category || null,
  group_result_id: result.group_result_id || null,
}));

    // ==========================================
    // OVERALL TEAM POINTS
    // ==========================================

    const countedOverallGroups = new Set<string>();

    const teamsWithPoints: Team[] = (
      teamData || []
    ).map((team) => {
      const teamName = team.team_name
        .trim()
        .toUpperCase();

      let totalPoints = 0;

      results.forEach((result) => {
        const resultTeam = (
          result.team || ""
        )
          .trim()
          .toUpperCase();

        if (resultTeam !== teamName) {
          return;
        }

        if (result.group_result_id) {
          const groupKey = `${teamName}-${result.group_result_id}`;

          if (
            countedOverallGroups.has(groupKey)
          ) {
            return;
          }

          countedOverallGroups.add(groupKey);

          totalPoints += result.points || 0;

          return;
        }

        totalPoints += result.points || 0;
      });

      return {
        ...team,
        points: totalPoints,
      };
    });

    teamsWithPoints.sort(
      (a, b) => b.points - a.points
    );

    setTeams(teamsWithPoints);

    // ==========================================
    // CATEGORY CHAMPIONS
    // ==========================================

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

      const team = (result.team || "")
        .trim()
        .toUpperCase();

      if (!category || !team) {
        return;
      }

      if (!categoryPoints[category]) {
        categoryPoints[category] = {};
      }

      if (
        result.group_result_id
      ) {
        const groupKey = `${category}-${team}-${result.group_result_id}`;

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
        !categoryPoints[category][team]
      ) {
        categoryPoints[category][team] = 0;
      }

      categoryPoints[category][team] +=
        result.points || 0;
    });

    const calculatedChampions: CategoryChampion[] =
      [];

    CATEGORIES.forEach((category) => {
      const teamsInCategory =
        categoryPoints[category] || {};

      const entries = Object.entries(
        teamsInCategory
      );

      if (entries.length === 0) {
        calculatedChampions.push({
          category,
          team: "No results yet",
          points: 0,
        });

        return;
      }

      entries.sort(
        (a, b) => b[1] - a[1]
      );

      const [winningTeam, winningPoints] =
        entries[0];

      calculatedChampions.push({
        category,
        team: winningTeam,
        points: winningPoints,
      });
    });

    setChampions(
      calculatedChampions
    );

    setLoading(false);
  }

  return (
    <DashboardLayout>

      {/* HEADER */}

      <div className="mb-10">

        <h1 className="text-4xl font-bold">
          🏆 Live Leaderboard
        </h1>

        <p className="text-gray-500 mt-2">
          Team Rankings
        </p>

      </div>

      {loading ? (

        <div className="text-center text-xl text-gray-500">
          Loading leaderboard...
        </div>

      ) : (

        <>
          {/* =====================================
              OVERALL TEAM LEADERBOARD
          ====================================== */}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

            {teams.map((team, index) => (

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

            ))}

          </div>

          {/* =====================================
              CATEGORY CHAMPIONS
          ====================================== */}

          <div className="mt-12">

            <div className="mb-6">

              <h2 className="text-3xl font-bold">
                🏆 Category Champions
              </h2>

              <p className="text-gray-500 mt-2">
                Champions are calculated from
                published results only.
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">

              {champions.map(
                (champion) => (

                  <div
                    key={champion.category}
                    className="bg-white rounded-2xl shadow-lg p-6 text-center border"
                  >

                    <div className="text-4xl mb-3">
                      🏆
                    </div>

                    <h3 className="text-xl font-bold">
                      {champion.category}
                    </h3>

                    <div className="mt-5">

                      {champion.team ===
                      "No results yet" ? (

                        <p className="text-gray-400">
                          No results yet
                        </p>

                      ) : (

                        <>
                          <p className="text-sm text-gray-500">
                            Category Champion
                          </p>

                          <p className="text-2xl font-bold text-green-700 mt-2">
                            {champion.team}
                          </p>

                          <p className="text-gray-500 mt-1">
                            {champion.points} Points
                          </p>
                        </>

                      )}

                    </div>

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

