"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import LiveHeader from "../components/LiveHeader";

type Winner = {
  programme_name: string;
  student_name: string;
  team: string;
  position: number;
  published_at: string;
};

type Team = {
  team: string;
  total_points: number;
};

export default function LivePage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [leaderboard, setLeaderboard] = useState<Team[]>([]);
  const [announcement, setAnnouncement] = useState<Winner | null>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    loadData();

    const timer = setInterval(loadData, 10000);

    const channel = supabase
      .channel("live-results")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "published_results",
        },
        (payload) => {
          const winner = payload.new as Winner;

          setAnnouncement(winner);
          setShowAnnouncement(true);

          setTimeout(() => {
            setShowAnnouncement(false);
          }, 12000);

          loadData();
        }
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadData() {
    const [{ data: winnersData }, { data: leaderboardData }] =
      await Promise.all([
        supabase
          .from("published_results")
          .select("*")
          .order("published_at", { ascending: false })
          .limit(5),

        supabase
          .from("leaderboard")
          .select("*")
          .order("total_points", { ascending: false }),
      ]);

    setWinners((winnersData as Winner[]) || []);
    setLeaderboard((leaderboardData as Team[]) || []);
  }

  return (
    <main className="min-h-screen bg-green-950 text-white p-8">

      {showAnnouncement && announcement && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

          <div className="bg-white rounded-3xl p-16 text-center shadow-2xl max-w-4xl w-full">

            <div className="text-8xl mb-6">🎉</div>

            <h2 className="text-5xl font-bold text-green-700">
              RESULT PUBLISHED
            </h2>

            <h3 className="text-4xl mt-8">
              {announcement.programme_name}
            </h3>

            <div className="text-7xl my-8">
              {announcement.position === 1
                ? "🥇"
                : announcement.position === 2
                ? "🥈"
                : announcement.position === 3
                ? "🥉"
                : "🏅"}
            </div>

            <div className="text-5xl font-bold">
              {announcement.student_name}
            </div>

            <div className="text-3xl mt-4 text-green-700">
              Team {announcement.team}
            </div>

          </div>
        </div>
      )}

      <LiveHeader />

      <div className="grid lg:grid-cols-2 gap-8">

        <div className="bg-green-900 rounded-2xl p-8 shadow-xl">

          <h2 className="text-4xl font-bold mb-6">
            🎉 Latest Winners
          </h2>

          {winners.map((winner, index) => (
            <div
              key={index}
              className="border-b border-green-700 py-5"
            >
              <h3 className="text-2xl font-bold">
                {winner.programme_name}
              </h3>

              <p className="text-xl mt-2">
                {winner.position === 1
                  ? "🥇"
                  : winner.position === 2
                  ? "🥈"
                  : winner.position === 3
                  ? "🥉"
                  : "🏅"}{" "}
                {winner.student_name}
              </p>

              <p className="text-yellow-300">
                Team {winner.team}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-green-900 rounded-2xl p-8 shadow-xl">

          <h2 className="text-4xl font-bold mb-6">
            🏆 Team Leaderboard
          </h2>

          {leaderboard.map((team, index) => (
            <div
              key={team.team}
              className="flex justify-between border-b border-green-700 py-4 text-2xl"
            >
              <span>
                {index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : "🏅"}{" "}
                {team.team}
              </span>

              <span className="font-bold text-yellow-300">
                {team.total_points}
              </span>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}