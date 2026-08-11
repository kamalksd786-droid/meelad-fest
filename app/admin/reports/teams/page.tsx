"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

type Team = {
  team: string;
  total_points: number;
};

export default function TeamReportPage() {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
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

  return (
    <div>

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          🏆 Team Results Report
        </h1>

        <button
          onClick={() => window.print()}
          className="bg-green-600 text-white px-5 py-2 rounded-lg"
        >
          🖨 Print
        </button>

      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-green-700 text-white">

            <tr>
              <th className="p-3">Rank</th>
              <th>Team</th>
              <th>Points</th>
            </tr>

          </thead>

          <tbody>

            {teams.map((team, index) => (

              <tr
                key={team.team}
                className="border-b text-center hover:bg-gray-50"
              >

                <td className="p-3">

                  {index === 0 && "🥇"}

                  {index === 1 && "🥈"}

                  {index === 2 && "🥉"}

                  {index > 2 && index + 1}

                </td>

                <td className="font-bold">
                  {team.team}
                </td>

                <td className="font-bold text-green-700">
                  {team.total_points}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}