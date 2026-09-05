"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-GB"));
  }, []);

  return (
    <header className="min-h-20 bg-white border-b flex items-center justify-between gap-4 pl-20 pr-4 sm:px-6 lg:px-8 py-3 shadow-sm">

      {/* LEFT */}
      <div className="min-w-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
          MUNAFASA 2026
        </h2>

        <p className="text-sm sm:text-base text-gray-500 truncate">
          Event Management Dashboard
        </p>
      </div>

      {/* RIGHT */}
      <div className="text-right shrink-0">
        <p className="font-semibold text-sm sm:text-base">
          Administrator
        </p>

        <p className="text-xs sm:text-sm text-gray-500">
          {today}
        </p>
      </div>

    </header>
  );
}