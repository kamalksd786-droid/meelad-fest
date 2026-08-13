"use client";

import { useEffect } from "react";

export default function TeacherAssignmentPage() {
  useEffect(() => {
    window.location.href = "/teacher-dashboard";
  }, []);

  return (
    <div className="p-8 text-center">
      <p>Opening Teacher Dashboard...</p>
    </div>
  );
}