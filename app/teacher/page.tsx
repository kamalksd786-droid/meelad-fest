"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // ADMIN CHECK
    const userData = localStorage.getItem("user");

    if (!userData) {
      window.location.href = "/login";
      return;
    }

    try {
      const user = JSON.parse(userData);

      if (user.role !== "admin") {
        alert("Access denied. Admin only.");
        window.location.href = "/teacher-dashboard";
        return;
      }

      setIsAdmin(true);
      loadTeachers();
    } catch {
      window.location.href = "/login";
    }
  }, []);

  async function loadTeachers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Teacher loading error:", error);
      alert(error.message);
      setTeachers([]);
    } else {
      setTeachers(data || []);
    }

    setSelectedIds([]);
    setLoading(false);
  }

  // SELECT ONE
  function toggleTeacher(id: number) {
    setSelectedIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter(
          (teacherId) => teacherId !== id
        );
      }

      return [...previous, id];
    });
  }

  // SELECT ALL
  function toggleSelectAll() {
    const allIds = teachers.map(
      (teacher) => teacher.id
    );

    const allSelected =
      teachers.length > 0 &&
      allIds.every((id) =>
        selectedIds.includes(id)
      );

    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  }

  // SINGLE DELETE
  async function deleteTeacher(teacher: any) {
    if (!isAdmin) {
      alert("Admin access required.");
      return;
    }

    const teacherName =
      teacher.name ||
      teacher.teacher_name ||
      teacher.teacher_id;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${teacherName}?`
    );

    if (!confirmed) return;

    setDeleting(true);

    // Remove programme assignments first
    const { error: assignmentError } =
      await supabase
        .from("teacher_programmes")
        .delete()
        .eq("teacher_id", teacher.id);

    if (assignmentError) {
      setDeleting(false);
      alert(
        "Could not remove teacher assignments: " +
          assignmentError.message
      );
      return;
    }

    // Delete teacher
    const { error } = await supabase
      .from("teachers")
      .delete()
      .eq("id", teacher.id);

    setDeleting(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("✅ Teacher deleted successfully.");

    await loadTeachers();
  }

  // BULK DELETE
  async function deleteSelectedTeachers() {
    if (!isAdmin) {
      alert("Admin access required.");
      return;
    }

    if (selectedIds.length === 0) {
      alert("Please select at least one teacher.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} selected teacher(s)?`
    );

    if (!confirmed) return;

    setDeleting(true);

    // Remove programme assignments
    const { error: assignmentError } =
      await supabase
        .from("teacher_programmes")
        .delete()
        .in("teacher_id", selectedIds);

    if (assignmentError) {
      setDeleting(false);
      alert(
        "Could not remove teacher assignments: " +
          assignmentError.message
      );
      return;
    }

    // Delete selected teachers
    const { error } = await supabase
      .from("teachers")
      .delete()
      .in("id", selectedIds);

    setDeleting(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert(
      `✅ ${selectedIds.length} teacher(s) deleted successfully.`
    );

    await loadTeachers();
  }

  const allSelected =
    teachers.length > 0 &&
    teachers.every((teacher) =>
      selectedIds.includes(teacher.id)
    );

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout>

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

        <div>
          <h1 className="text-4xl font-bold">
            👨‍🏫 Teachers Management
          </h1>

          <p className="text-gray-500 mt-2">
            Manage teachers and teacher access
          </p>
        </div>

        <Link
          href="/teachers/add"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold"
        >
          ➕ Add Teacher
        </Link>

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-blue-600 text-white rounded-xl p-6">
          <p className="text-lg">
            Total Teachers
          </p>

          <p className="text-4xl font-bold mt-2">
            {teachers.length}
          </p>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-6">
          <p className="text-lg">
            Teacher Registration
          </p>

          <Link
            href="/teacher-registration"
            className="inline-block mt-3 bg-white text-green-700 px-4 py-2 rounded-lg font-bold"
          >
            Open Registration
          </Link>
        </div>

        <div className="bg-purple-600 text-white rounded-xl p-6">
          <p className="text-lg">
            Teacher Assignment
          </p>

          <Link
            href="/teacher-assignment"
            className="inline-block mt-3 bg-white text-purple-700 px-4 py-2 rounded-lg font-bold"
          >
            Open Assignment
          </Link>
        </div>

      </div>

      {/* BULK DELETE BAR */}

      <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <label className="flex items-center gap-3 font-semibold cursor-pointer">

          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="w-5 h-5"
          />

          Select All

          {teachers.length > 0 &&
            ` (${teachers.length})`}

        </label>

        <button
          type="button"
          onClick={deleteSelectedTeachers}
          disabled={
            deleting ||
            selectedIds.length === 0
          }
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold"
        >
          {deleting
            ? "Deleting..."
            : `🗑️ Delete Selected${
                selectedIds.length > 0
                  ? ` (${selectedIds.length})`
                  : ""
              }`}
        </button>

      </div>

      {/* TEACHER LIST */}

      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">
            Teacher List
          </h2>
        </div>

        {loading ? (

          <div className="p-6 text-gray-500">
            Loading teachers...
          </div>

        ) : teachers.length === 0 ? (

          <div className="p-6 text-gray-500">
            No teachers found.
          </div>

        ) : (

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-5 h-5"
                  />
                </th>

                <th className="p-4 text-left">
                  Name
                </th>

                <th className="p-4 text-left">
                  Teacher ID
                </th>

                <th className="p-4 text-left">
                  Username
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-left">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {teachers.map((teacher) => (

                <tr
                  key={teacher.id}
                  className={`border-b ${
                    selectedIds.includes(
                      teacher.id
                    )
                      ? "bg-red-50"
                      : ""
                  }`}
                >

                  <td className="p-4 text-center">

                    <input
                      type="checkbox"
                      checked={selectedIds.includes(
                        teacher.id
                      )}
                      onChange={() =>
                        toggleTeacher(
                          teacher.id
                        )
                      }
                      className="w-5 h-5"
                    />

                  </td>

                  <td className="p-4 font-semibold">
                    {teacher.name ||
                      teacher.teacher_name ||
                      "-"}
                  </td>

                  <td className="p-4">
                    {teacher.teacher_id ||
                      teacher.id ||
                      "-"}
                  </td>

                  <td className="p-4">
                    {teacher.username || "-"}
                  </td>

                  <td className="p-4">

                    {teacher.active ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
                        Inactive
                      </span>
                    )}

                  </td>

                  <td className="p-4 whitespace-nowrap">

                    <Link
                      href={`/teachers/${teacher.id}`}
                      className="text-blue-600 font-semibold mr-5"
                    >
                      👁️ View
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        deleteTeacher(teacher)
                      }
                      disabled={deleting}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400 font-semibold"
                    >
                      🗑️ Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </DashboardLayout>
  );
}