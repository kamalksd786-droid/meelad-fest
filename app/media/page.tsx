"use client";

import Link from "next/link";
import Navbar from "../../components/Navbar";
import BackButton from "../components/layout/BackButton";


const cards = [
  {
    title: "📸 Posters",
    desc: "Participation & Winner Posters",
    href: "/media/posters",
    color: "from-blue-600 to-blue-800",
  },
  {
    title: "📜 Certificates",
    desc: "Participation & Winner Certificates",
    href: "/media/certificates",
    color: "from-green-600 to-green-800",
  },
  {
    title: "🏆 Results",
    desc: "Winner Management",
    href: "/media/results",
    color: "from-yellow-500 to-orange-600",
  },
  {
    title: "👥 Team Posters",
    desc: "Generate Team Posters",
    href: "/media/team-posters",
    color: "from-purple-600 to-purple-800",
  },
  {
    title: "🎥 Slideshow",
    desc: "Automatic Event Slideshow",
    href: "/media/slideshow",
    color: "from-pink-600 to-red-600",
  },
  {
    title: "🖼 Gallery",
    desc: "All Generated Media",
    href: "/media/gallery",
    color: "from-cyan-600 to-sky-700",
  },
];

export default function MediaDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">

      <div className="bg-blue-900 text-white py-8 shadow-lg">
        <h1 className="text-4xl font-bold text-center">
          MUNAFASA 2026
        </h1>

        <p className="text-center mt-2 text-blue-100">
          Media Studio Dashboard
        </p>
      </div>

      <div className="max-w-7xl mx-auto p-8">

        <div className="grid md:grid-cols-3 gap-8">

          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`
                rounded-2xl
                shadow-xl
                text-white
                p-8
                bg-gradient-to-br
                ${card.color}
                hover:scale-105
                transition
              `}
            >
              <h2 className="text-3xl font-bold">
                {card.title}
              </h2>

              <p className="mt-4 text-lg">
                {card.desc}
              </p>
            </Link>
          ))}

        </div>

      </div>

    </div>
  );
}