"use client";

import Link from "next/link";

const reports = [
  {
    title: "Programme Results",
    description: "View programme-wise results",
    link: "/admin/reports/programmes",
    icon: "🎭",
  },
  {
    title: "Team Results",
    description: "View team-wise points",
    link: "/admin/reports/teams",
    icon: "🏆",
  },
  {
    title: "Student Participation",
    description: "View student participation list",
    link: "/admin/reports/students",
    icon: "👨‍🎓",
  },
  {
    title: "Judge Report",
    description: "View judge-wise scoring",
    link: "/admin/reports/judges",
    icon: "👨‍⚖️",
  },
];

export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        📊 Reports
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        {reports.map((report) => (

          <Link
            key={report.link}
            href={report.link}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
          >

            <div className="text-5xl">
              {report.icon}
            </div>

            <h2 className="text-2xl font-bold mt-4">
              {report.title}
            </h2>

            <p className="text-gray-500 mt-2">
              {report.description}
            </p>

          </Link>

        ))}

      </div>
    </div>
  );
}