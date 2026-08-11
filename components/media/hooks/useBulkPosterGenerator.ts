"use client";

import { useState } from "react";

export function useBulkPosterGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStudent, setCurrentStudent] = useState("");

  async function generate(
    students: any[],
    callback: (student: any) => Promise<void>
  ) {
    setIsGenerating(true);

    for (let i = 0; i < students.length; i++) {
      setCurrentStudent(students[i].student_name);

      await callback(students[i]);

      setProgress(Math.round(((i + 1) / students.length) * 100));
    }

    setCurrentStudent("");
    setIsGenerating(false);
  }

  return {
    generate,
    isGenerating,
    progress,
    currentStudent,
  };
}