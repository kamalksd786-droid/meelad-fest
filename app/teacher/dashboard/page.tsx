"use client";

import Link from "next/link";

const categories = [
  {
    name: "Kiddies",
    icon: "🧒",
    color: "bg-pink-500",
  },
  {
    name: "Sub Junior",
    icon: "🎒",
    color: "bg-blue-500",
  },
  {
    name: "Junior",
    icon: "📘",
    color: "bg-green-500",
  },
  {
    name: "Senior",
    icon: "🎓",
    color: "bg-yellow-500",
  },
  {

    icon: "🏆",
    color: "bg-red-500",
  },
];

export default function TeacherDashboard() {
  function logout() {
    localStorage.removeItem("teacherId");
    localStorage.removeItem("teacherName");
    window.location.href = "/teacher-login";
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-purple-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

          <div>
            <h1 className="text-3xl font-bold">
              MUNAFASA 2026
            </h1>

            <p className="text-purple-200">
              Teacher Dashboard
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold"
          >
            Logout
          </button>

        </div>
      </header>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-2xl font-bold">
            Welcome Teacher
          </h2>

          <p className="text-gray-600 mt-2">
            Select a category to assign programmes.
          </p>

        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          <Link
            href="/teacher/register"
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg p-6 transition"
          >
            <div className="text-4xl mb-3">
              📝
            </div>

            <h3 className="text-2xl font-bold">
              Register Students
            </h3>

            <p className="mt-2 opacity-90">
              Assign programmes to students
            </p>
          </Link>

          <Link
            href="/teacher/registrations"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg p-6 transition"
          >
            <div className="text-4xl mb-3">
              📋
            </div>

            <h3 className="text-2xl font-bold">
              View Registrations
            </h3>

            <p className="mt-2 opacity-90">
              View programmes registered by you
            </p>
          </Link>

        </div>

        {/* Categories */}
        <h2 className="text-2xl font-bold mb-5">
          Student Categories
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {categories.map((category) => (

            <Link
              key={category.name}
              href={`/teacher/category/${encodeURIComponent(category.name ?? "")}`}
              className={`${category.color} rounded-2xl p-8 text-white hover:scale-105 transition duration-200 shadow-lg`}
            >

              <div className="text-5xl mb-4">
                {category.icon}
              </div>

              <h3 className="text-2xl font-bold">
                {category.name}
              </h3>

              <p className="mt-2 opacity-90">
                View Students →
              </p>

            </Link>

          ))}

        </div>

      </div>

    </div>
  );
}

