"use client";

import Link from "next/link";

export default function DashboardPage() {
  const cards = [
    { title: "👨 Students", href: "/students" },
    { title: "👨‍🏫 Teachers", href: "/teacher-dashboard" },
    { title: "👥 Teams", href: "/teams" },

    { title: "🎭 Programmes", href: "/programmes" },
    { title: "📝 Registrations", href: "/registrations" },
    { title: "📋 Programme Assigned Lists", href: "/programme-assignment-report" },

    { title: "⚖️ Judge Sheets", href: "/score-entry" },
    { title: "👨‍👩‍👧 Parent Portal", href: "/parent" },
    { title: "🏆 Result Entry", href: "/result-entry" },

    { title: "🎬 Programme Control", href: "/programme-control" },
    { title: "🥇 Leaderboard", href: "/leaderboard" },
    { title: "📺 Live Display", href: "/live-display" },

    { title: "📜 Certificates", href: "/certificates" },
    { title: "📊 Reports", href: "/reports" },
    { title: "⚙️ Settings", href: "/settings" },

    { title: "🏆 Result Management", href: "/results" },
    { title: "👨‍🎓 Student Directory", href: "/student-directory" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">
        🏫 MUNAFASA 2026 Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border p-6 shadow hover:bg-green-50 transition"
          >
            <h2 className="text-xl font-semibold">
              {card.title}
            </h2>
          </Link>
        ))}
      </div>
    </div>
  );
}