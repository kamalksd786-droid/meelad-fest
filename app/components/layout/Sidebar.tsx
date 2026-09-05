"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  const [role, setRole] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [schoolOpen, setSchoolOpen] = useState(true);
  const [eventOpen, setEventOpen] = useState(true);
  const [mediaOpen, setMediaOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setRole(user.role || "");
      } catch {
        setRole("");
      }
    }
  }, []);

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("parentStudent");
    router.push("/login");
  }

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-slate-950 text-white px-4 py-3 rounded-lg shadow-lg text-xl"
      >
        ☰
      </button>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 z-50
          w-64 bg-slate-950 text-white min-h-screen
          flex flex-col overflow-y-auto
          transform transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
      <div className="p-6 border-b border-slate-700">

        <h1 className="text-2xl font-bold">
          MUNAFASA 2026
        </h1>

        <p className="text-slate-400 mt-1">
          {role === "teacher"
            ? "Teacher Portal"
            : "Admin Dashboard"}
        </p>

      </div>

      {/* ========================= */}
      {/* TEACHER SIDEBAR */}
      {/* ========================= */}

     {role === "teacher" && (
  <div className="p-3 flex-1">

    <Link
      href="/teacher-dashboard"
      className="block px-4 py-3 rounded-lg hover:bg-slate-800"
    >
      🏠 Dashboard
    </Link>

    <Link
      href="/teacher-assignment"
      className="block px-4 py-3 rounded-lg hover:bg-slate-800"
    >
      🎭 Programme Assignment
    </Link>

    <button
      type="button"
      onClick={logout}
      className="w-full text-left px-4 py-3 mt-4 rounded-lg hover:bg-red-900 text-red-300"
    >
      🚪 Logout
    </button>

  </div>
)}

      {/* ========================= */}
      {/* ADMIN SIDEBAR */}
      {/* ========================= */}

      {role !== "teacher" && (
        <div className="p-3 flex-1">

          <Link
            href="/dashboard"
            className="block px-4 py-3 rounded-lg hover:bg-slate-800"
          >
            🏠 Dashboard
          </Link>

          {/* SCHOOL MANAGEMENT */}

          <button
            type="button"
            onClick={() =>
              setSchoolOpen(!schoolOpen)
            }
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800"
          >
            📚 School Management
          </button>

          {schoolOpen && (
            <div className="ml-6">

              <Link
                href="/students"
                className="block py-2 hover:text-green-400"
              >
                👨‍🎓 Students
              </Link>

              <Link
                href="/teacher-dashboard"
                className="block py-2 hover:text-green-400"
              >
                👨‍🏫 Teachers
              </Link>

              <Link
                href="/parent"
                className="block py-2 hover:text-green-400"
              >
                👨‍👩‍👧 Parents
              </Link>

            </div>
          )}

          {/* EVENT MANAGEMENT */}

          <button
            type="button"
            onClick={() =>
              setEventOpen(!eventOpen)
            }
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800 mt-2"
          >
            🎭 Event Management
          </button>

          {eventOpen && (
            <div className="ml-6">

              <Link
                href="/programmes"
                className="block py-2 hover:text-green-400"
              >
                🎭 Programmes
              </Link>

              <Link
                href="/registrations"
                className="block py-2 hover:text-green-400"
              >
                📝 Registrations
              </Link>

              <Link
                href="/judges"
                className="block py-2 hover:text-green-400"
              >
                👨‍⚖️ Judges
              </Link>

              <Link
                href="/settings/stages"
                className="block py-2 hover:text-green-400"
              >
                🎤 Stages
              </Link>

              <Link
                href="/schedule"
                className="block py-2 hover:text-green-400"
              >
                📅 Scheduling
              </Link>

              <Link
                href="/leaderboard"
                className="block py-2 hover:text-green-400"
              >
                🥇 Leaderboard
              </Link>

              <Link
                href="/teacher-assignment"
                className="block py-2 hover:text-green-400"
              >
                👨‍🏫 Teacher Assignment
              </Link>

            </div>
          )}

          {/* MEDIA STUDIO */}

          <button
            type="button"
            onClick={() =>
              setMediaOpen(!mediaOpen)
            }
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800 mt-2"
          >
            🎨 Media Studio
          </button>

          {mediaOpen && (
            <div className="ml-6">

              <Link
                href="/media/certificates"
                className="block py-2 hover:text-green-400"
              >
                📜 Certificates
              </Link>

              <Link
                href="/media/posters"
                className="block py-2 hover:text-green-400"
              >
                🖼 Posters
              </Link>

              <Link
                href="/gallery"
                className="block py-2 hover:text-green-400"
              >
                🖼 Gallery
              </Link>

            </div>
          )}

          {/* SETTINGS */}

          <Link
            href="/settings"
            className="block px-4 py-3 rounded-lg hover:bg-slate-800 mt-2"
          >
            ⚙️ Settings
          </Link>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={logout}
            className="w-full text-left px-4 py-3 mt-4 rounded-lg hover:bg-red-900 text-red-300"
          >
            🚪 Logout
          </button>

        </div>
      )}

        </aside>
    </>
  );
}