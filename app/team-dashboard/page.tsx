"use client";

import { useEffect } from "react";

export default function TeamDashboardPage() {
  useEffect(() => {
    window.location.href = "/teams";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-600">
        Redirecting to Teams...
      </p>
    </div>
  );
}