"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-GB"));
  }, []);

  return (
    <header className="h-20 bg-white border-b flex items-center justify-between px-8 shadow-sm">

      <div>
        <h2 className="text-3xl font-bold text-slate-800">
          MUNAFASA 2026
        </h2>

        <p className="text-gray-500">
          Event Management Dashboard
        </p>
      </div>

      <div className="text-right">
        <p className="font-semibold">
          Administrator
        </p>

        <p className="text-sm text-gray-500">
          {today}
        </p>
      </div>

    </header>
  );
}