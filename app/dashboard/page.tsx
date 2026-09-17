"use client";

import Link from "next/link";

export default function DashboardPage() {
  const cards = [
    { title: "👨 Students", href: "/students" },
    { title: "👨‍🏫 Teachers", href: "/teacher-dashboard" },
    { title: "👥 Teams", href: "/teams" },

    { title: "🎭 Programmes", href: "/programmes" },
    { title: "📝 Registrations", href: "/registrations" },
    {
      title: "📋 Programme Assigned Lists",
      href: "/programme-assignment-report",
    },

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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
            MUNAFASA 2026
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Manage students, programmes, registrations, results and event
            operations.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="
                group
                rounded-xl
                border border-slate-200
                bg-white
                p-5
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-indigo-200
                hover:shadow-md
              "
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-semibold text-slate-800 transition-colors group-hover:text-indigo-600 sm:text-lg">
                  {card.title}
                </h2>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-all group-hover:bg-indigo-50 group-hover:text-indigo-600">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}