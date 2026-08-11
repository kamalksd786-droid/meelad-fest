"use client";

import { useEffect } from "react";

export default function ImportTeachersPage() {
  useEffect(() => {
    window.location.href = "/teachers";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-600">
        Redirecting...
      </p>
    </div>
  );
}