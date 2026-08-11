"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6 overflow-x-auto">

        <Link href="/dashboard" className="font-bold hover:text-yellow-300">
          🏠 Dashboard
        </Link>

        <Link href="/students" className="hover:text-yellow-300">
          👨‍🎓 Students
        </Link>

        <Link href="/teachers" className="hover:text-yellow-300">
          👨‍🏫 Teachers
        </Link>

        <Link href="/parents" className="hover:text-yellow-300">
          👨‍👩‍👧 Parents
        </Link>

        <Link href="/programmes" className="hover:text-yellow-300">
          🎭 Programmes
        </Link>

        <Link href="/registrations" className="hover:text-yellow-300">
          📝 Registrations
        </Link>

        <Link href="/judge-dashboard" className="hover:text-yellow-300">
          ⚖ Judges
        </Link>

        <Link href="/leaderboard" className="hover:text-yellow-300">
          🏆 Leaderboard
        </Link>

        <Link href="/media/results" className="hover:text-yellow-300">
          📊 Results
        </Link>

        <Link href="/media/certificates" className="hover:text-yellow-300">
          📜 Certificates
        </Link>

        <Link href="/media/posters" className="hover:text-yellow-300">
          🖼 Posters
        </Link>

        <Link href="/reports" className="hover:text-yellow-300">
          📈 Reports
        </Link>

      </div>
    </nav>
  );
}