"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import BackButton from "../components/layout/BackButton";
import { supabase } from "@/lib/supabase";

type Result = {
  id: number;
  programme_id: number;
  programme_name: string;
  category: string | null;
  admission_no: string | null;
  student_name: string;
  team: string;
  position: string;
  points: number;
  published: boolean;
  group_result_id: string | null;
  created_at: string;
};

type ResultGroup = {
  key: string;
  programme_id: number;
  programme_name: string;
  category: string | null;
  team: string;
  position: string;
  points: number;
  published: boolean;
  students: Result[];
};

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [groups, setGroups] = useState<ResultGroup[]>([]);

  const [selectedGroups, setSelectedGroups] =
    useState<string[]>([]);

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
      loadResults();
    } catch {
      window.location.href = "/login";
    }
  }, []);

  async function loadResults() {
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      alert(error.message);
      return;
    }

    const allResults: Result[] = data || [];

    setResults(allResults);

    /*
      GROUP RESULTS

      Group members have the same group_result_id.

      Individual results get their own unique key.
    */

    const groupMap = new Map<string, Result[]>();

    allResults.forEach((result) => {
      const key =
        result.group_result_id ||
        `individual-${result.id}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }

      groupMap.get(key)!.push(result);
    });

    const groupedResults: ResultGroup[] = [];

    groupMap.forEach((students, key) => {
      const first = students[0];

      groupedResults.push({
        key,
        programme_id: first.programme_id,
        programme_name: first.programme_name,
        category: first.category,
        team: first.team,
        position: first.position,
        points: first.points,
        published: students.every(
          (student) => student.published
        ),
        students,
      });
    });

    setGroups(groupedResults);
    setSelectedGroups([]);
  }

  // -----------------------------------------
  // SELECT ONE GROUP
  // -----------------------------------------

  function toggleGroup(key: string) {
    setSelectedGroups((previous) => {
      if (previous.includes(key)) {
        return previous.filter(
          (item) => item !== key
        );
      }

      return [...previous, key];
    });
  }

  // -----------------------------------------
  // SELECT ALL GROUPS
  // -----------------------------------------

  function toggleSelectAll() {
    const allKeys = groups.map(
      (group) => group.key
    );

    const allSelected =
      groups.length > 0 &&
      allKeys.every((key) =>
        selectedGroups.includes(key)
      );

    if (allSelected) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(allKeys);
    }
  }

  // -----------------------------------------
  // SINGLE DELETE
  // -----------------------------------------

  async function deleteResult(
    group: ResultGroup
  ) {
    if (!isAdmin) {
      alert("Admin access required.");
      return;
    }

    const message =
      group.students.length > 1
        ? `Delete this entire group result containing ${group.students.length} students?`
        : `Delete the result of ${group.students[0].student_name}?`;

    const ok = window.confirm(
      message +
        "\n\nThis action cannot be undone."
    );

    if (!ok) return;

    setDeleting(true);

    const resultIds = group.students.map(
      (student) => student.id
    );

    const { error } = await supabase
      .from("results")
      .delete()
      .in("id", resultIds);

    setDeleting(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("✅ Result deleted successfully.");

    await loadResults();
  }

  // -----------------------------------------
  // BULK DELETE
  // -----------------------------------------

  async function deleteSelectedResults() {
    if (!isAdmin) {
      alert("Admin access required.");
      return;
    }

    if (selectedGroups.length === 0) {
      alert("Please select at least one result.");
      return;
    }

    const selectedResultGroups =
      groups.filter((group) =>
        selectedGroups.includes(group.key)
      );

    const totalStudentResults =
      selectedResultGroups.reduce(
        (total, group) =>
          total + group.students.length,
        0
      );

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedGroups.length} selected result(s)?\n\n` +
        `${totalStudentResults} student result record(s) will be deleted.\n\n` +
        `This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);

    const resultIds =
      selectedResultGroups.flatMap(
        (group) =>
          group.students.map(
            (student) => student.id
          )
      );

    const { error } = await supabase
      .from("results")
      .delete()
      .in("id", resultIds);

    setDeleting(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      `✅ ${selectedGroups.length} result group(s) deleted successfully.`
    );

    await loadResults();
  }

  // -----------------------------------------
  // PUBLISH
  // -----------------------------------------

  async function publishResult(
    group: ResultGroup
  ) {
    const ok = confirm(
      group.students.length > 1
        ? `Publish this group result with ${group.students.length} students?`
        : "Publish this result?"
    );

    if (!ok) return;

    const { error } = await supabase
      .from("results")
      .update({
        published: true,
      })
      .in(
        "id",
        group.students.map(
          (student) => student.id
        )
      );

    if (error) {
      alert(error.message);
      return;
    }

    alert("✅ Result Published");

    loadResults();
  }

  // -----------------------------------------
  // UNPUBLISH
  // -----------------------------------------

  async function unpublishResult(
    group: ResultGroup
  ) {
    const ok = confirm(
      group.students.length > 1
        ? "Unpublish this entire group result?"
        : "Unpublish this result?"
    );

    if (!ok) return;

    const { error } = await supabase
      .from("results")
      .update({
        published: false,
      })
      .in(
        "id",
        group.students.map(
          (student) => student.id
        )
      );

    if (error) {
      alert(error.message);
      return;
    }

    alert("Result unpublished");

    loadResults();
  }

  const allSelected =
    groups.length > 0 &&
    groups.every((group) =>
      selectedGroups.includes(group.key)
    );

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout>

      <BackButton />

      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-4xl font-bold">
            🏆 Results Management
          </h1>

          <p className="text-gray-500 mt-2">
            Total Results : {groups.length}
          </p>

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

          {groups.length > 0 &&
            ` (${groups.length})`}

        </label>

        <button
          type="button"
          onClick={deleteSelectedResults}
          disabled={
            deleting ||
            selectedGroups.length === 0
          }
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold"
        >
          {deleting
            ? "Deleting..."
            : `🗑️ Delete Selected${
                selectedGroups.length > 0
                  ? ` (${selectedGroups.length})`
                  : ""
              }`}
        </button>

      </div>

      {/* RESULTS TABLE */}

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

        <table className="w-full">

          <thead className="bg-blue-900 text-white">

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
                Programme ID
              </th>

              <th className="p-4 text-left">
                Category
              </th>

              <th className="p-4 text-left">
                Programme
              </th>

              <th className="p-4 text-left">
                Students
              </th>

              <th className="p-4 text-left">
                Team
              </th>

              <th className="p-4 text-left">
                Position
              </th>

              <th className="p-4 text-left">
                Points
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-center">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {groups.length === 0 ? (

              <tr>
                <td
                  colSpan={10}
                  className="p-8 text-center text-gray-500"
                >
                  No results found.
                </td>
              </tr>

            ) : (

              groups.map((group) => (

                <tr
                  key={group.key}
                  className={`border-b hover:bg-gray-50 align-top ${
                    selectedGroups.includes(
                      group.key
                    )
                      ? "bg-red-50"
                      : ""
                  }`}
                >

                  {/* SELECT */}

                  <td className="p-4 text-center">

                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(
                        group.key
                      )}
                      onChange={() =>
                        toggleGroup(
                          group.key
                        )
                      }
                      className="w-5 h-5"
                    />

                  </td>

                  {/* PROGRAMME ID */}

                  <td className="p-4 font-bold">
                    {group.programme_id}
                  </td>

                  {/* CATEGORY */}

                  <td className="p-4">
                    {group.category || "-"}
                  </td>

                  {/* PROGRAMME */}

                  <td className="p-4 font-semibold">
                    {group.programme_name}
                  </td>

                  {/* STUDENTS */}

                  <td className="p-4">

                    <div className="space-y-2">

                      {group.students.map(
                        (student, index) => (

                          <div
                            key={student.id}
                            className="bg-gray-100 rounded-lg px-3 py-2"
                          >

                            <div className="font-semibold">
                              {index + 1}.{" "}
                              {student.student_name}
                            </div>

                            {student.admission_no && (
                              <div className="text-xs text-gray-500">
                                Admission:{" "}
                                {
                                  student.admission_no
                                }
                              </div>
                            )}

                          </div>

                        )
                      )}

                    </div>

                  </td>

                  {/* TEAM */}

                  <td className="p-4 font-bold">
                    {group.team}
                  </td>

                  {/* POSITION */}

                  <td className="p-4 font-bold">

                    {group.position ===
                    "First"
                      ? "🥇 First"
                      : group.position ===
                        "Second"
                      ? "🥈 Second"
                      : "🥉 Third"}

                  </td>

                  {/* POINTS */}

                  <td className="p-4 font-bold">
                    {group.points}
                  </td>

                  {/* STATUS */}

                  <td className="p-4">

                    {group.published ? (

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                        ✅ Published
                      </span>

                    ) : (

                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                        🔒 Not Published
                      </span>

                    )}

                  </td>

                  {/* ACTIONS */}

                  <td className="p-4 text-center">

                    <div className="flex flex-col gap-2">

                      {group.published ? (

                        <button
                          type="button"
                          onClick={() =>
                            unpublishResult(
                              group
                            )
                          }
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold whitespace-nowrap"
                        >
                          Unpublish
                        </button>

                      ) : (

                        <button
                          type="button"
                          onClick={() =>
                            publishResult(
                              group
                            )
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold whitespace-nowrap"
                        >
                          📢 Publish
                        </button>

                      )}

                      <button
                        type="button"
                        onClick={() =>
                          deleteResult(group)
                        }
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold whitespace-nowrap"
                      >
                        🗑️ Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </DashboardLayout>
  );
}