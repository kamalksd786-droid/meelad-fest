"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Team = {
  team: string;
  total_points: number;
};

export default function ChampionshipPage() {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    loadChampionship();
  }, []);

  async function loadChampionship() {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("total_points", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setTeams(data || []);
  }

  const medals = ["🥇", "🥈", "🥉", "4️⃣"];

  return (
    <div className="max-w-5xl mx-auto">

      <h1 className="text-5xl font-bold text-center mb-10">
        🏆 Championship
      </h1>

      <div className="space-y-5">

        {teams.map((team, index) => (

          <div
            key={team.team}
            className="bg-white rounded-2xl shadow-lg p-6 flex justify-between items-center"
          >

            <div className="flex items-center gap-5">

              <span className="text-5xl">
                {medals[index] || "🏅"}
              </span>

              <div>

                <h2 className="text-3xl font-bold">
                  {team.team}
                </h2>

                <p className="text-gray-500">
                  Rank #{index + 1}
                </p>

              </div>

            </div>

            <div className="text-right">

              <p className="text-gray-500">
                Championship Points
              </p>

              <h2 className="text-5xl font-bold text-green-700">
                {team.total_points}
              </h2>

            </div>

          </div>

        ))}

        {teams.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center shadow">
            No championship points available yet.
          </div>
        )}

      </div>

    </div>
  );
}