"use client";

import Link from "next/link";

export default function ParentDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-purple-800 text-white px-6 py-6 shadow">
        <div className="max-w-6xl mx-auto">

          <h1 className="text-3xl font-bold">
            MUNAFASA 2026
          </h1>

          <p className="text-purple-200">
            Parent Portal
          </p>

        </div>
      </header>

      {/* Dashboard */}
      <main className="max-w-6xl mx-auto p-6">

        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-3xl font-bold">
            👨‍👩‍👧 Parent Dashboard
          </h2>

          <p className="text-gray-600 mt-2">
            Manage your child's MUNAFASA 2026 activities and view published results.
          </p>

        </div>

        {/* Main Options */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Programme Registration */}
          <Link
            href="/parent/programmes"
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-8 shadow-lg transition"
          >

            <div className="text-5xl mb-4">
              📝
            </div>

            <h3 className="text-2xl font-bold">
              Programme Registration
            </h3>

            <p className="mt-2">
              Register your child for MUNAFASA programmes.
            </p>

          </Link>

          {/* Results */}
          <Link
            href="/parent/results"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-8 shadow-lg transition"
          >

            <div className="text-5xl mb-4">
              🏆
            </div>

            <h3 className="text-2xl font-bold">
              Results
            </h3>

            <p className="mt-2">
              View your child's published results.
            </p>

            <div className="mt-4 inline-block bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold">
              View Results →
            </div>

          </Link>

        </div>

        {/* Information */}
        <div className="bg-white rounded-xl shadow p-6 mt-8">

          <h3 className="text-xl font-bold mb-3">
            ℹ️ Result Information
          </h3>

          <p className="text-gray-600">
            Results will be visible here only after the administrator publishes them.
          </p>

        </div>

      </main>

    </div>
  );
}