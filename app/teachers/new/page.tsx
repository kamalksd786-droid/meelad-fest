"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddTeacherPage() {
  const [teacherName, setTeacherName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function addTeacher() {
    if (!teacherName.trim() || !teacherId.trim() || !password.trim()) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("teachers")
      .insert({
        teacher_name: teacherName.trim(),
        teacher_id: teacherId.trim(),
        password: password.trim(),
      });

    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
      return;
    }

    alert("✅ Teacher added successfully.");

    setTeacherName("");
    setTeacherId("");
    setPassword("");

    setLoading(false);

    window.location.href = "/teachers";
  }

  return (
    <div className="max-w-2xl mx-auto">

      <div className="bg-white rounded-xl shadow-lg p-8">

        <h1 className="text-3xl font-bold mb-2">
          👨‍🏫 Add Teacher
        </h1>

        <p className="text-gray-500 mb-8">
          Create a teacher account for MUNAFASA 2026.
        </p>

        <div className="space-y-5">

          <div>
            <label className="block font-semibold mb-2">
              Teacher Name
            </label>

            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="Enter teacher name"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Teacher ID
            </label>

            <input
              type="text"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              placeholder="Enter Teacher ID"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div className="flex gap-3 pt-4">

            <button
              type="button"
              onClick={addTeacher}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold"
            >
              {loading ? "Saving..." : "➕ Add Teacher"}
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/teachers";
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}