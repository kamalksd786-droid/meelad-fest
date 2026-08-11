"use client";

import { useEffect } from "react";

export default function TeacherLoginPage() {
  useEffect(() => {
    window.location.href = "/login";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-600">
        Redirecting to Teacher Login...
      </p>
    </div>
  );
}