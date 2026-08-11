"use client";

import DashboardLayout from "../components/layout/DashboardLayout";
import BackButton from "../components/layout/BackButton";
import Link from "next/link";

export default function SettingsPage() {
  const items = [
    {
      title: "🏟️ Stages",
      description: "Manage competition stages",
      link: "/settings/stages",
    },
    {
      title: "👥 Teams",
      description: "Manage team names",
      link: "/settings/teams",
    },
    {
      title: "🎓 Categories",
      description: "Manage competition categories",
      link: "/settings/categories",
    },
    {
      title: "🎭 Programme Types",
      description: "Manage programme types",
      link: "/settings/programme-types",
    },
    {
      title: "👤 Participant Types",
      description: "Manage participant types",
      link: "/settings/participant-types",
    },
    {
      title: "⭐ Point Rules",
      description: "Manage scoring rules",
      link: "/settings/point-rules",
    },
  ];

  return (
    <DashboardLayout>
      <BackButton />

      <h1 className="text-4xl font-bold mb-8">⚙️ Master Settings</h1>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.link}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
          >
            <h2 className="text-2xl font-bold mb-3">{item.title}</h2>
            <p className="text-gray-500">{item.description}</p>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}