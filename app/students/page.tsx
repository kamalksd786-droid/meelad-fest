"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // NEW: selected students for bulk delete
  const [selectedIds, setSelectedIds] = useState<
    (string | number)[]
  >([]);

  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    student_name: "",
    admission_no: "",
    chest_no: "",
    class: "",
    category: "",
    gender: "",
    team: "",
  });

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("student_name");

    if (error) {
      console.error(error);
      alert("Unable to load students.");
      return;
    }

    setStudents(data || []);
    setSelectedIds([]);
  }

  const filteredStudents = students.filter(
    (student) =>
      student.student_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      student.admission_no
        ?.toString()
        .includes(search)
  );

  function updateForm(field: string, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm({
      student_name: "",
      admission_no: "",
      chest_no: "",
      class: "",
      category: "",
      gender: "",
      team: "",
    });

    setEditingId(null);
    setShowAddForm(false);
  }

  async function saveStudent() {
    if (!form.student_name.trim()) {
      alert("Please enter student name.");
      return;
    }

    if (!form.admission_no.trim()) {
      alert("Please enter admission number.");
      return;
    }

    if (!form.category) {
      alert("Please select category.");
      return;
    }

    if (!form.gender) {
      alert("Please select gender.");
      return;
    }

    setSaving(true);

    const studentData = {
      student_name: form.student_name.trim(),
      admission_no: form.admission_no.trim(),
      chest_no: form.chest_no.trim(),
      class: form.class.trim(),
      category: form.category,
      gender: form.gender,
      team: form.team.trim(),
    };

    let error;

    if (editingId !== null) {
      const result = await supabase
        .from("students")
        .update(studentData)
        .eq("id", editingId);

      error = result.error;
    } else {
      const result = await supabase
        .from("students")
        .insert(studentData);

      error = result.error;
    }

    setSaving(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert(
      editingId !== null
        ? "✅ Student updated successfully."
        : "✅ Student added successfully."
    );

    resetForm();
    loadStudents();
  }

  function editStudent(student: any) {
    setForm({
      student_name: student.student_name || "",
      admission_no:
        student.admission_no?.toString() || "",
      chest_no:
        student.chest_no?.toString() || "",
      class: student.class || "",
      category: student.category || "",
      gender: student.gender || "",
      team: student.team || "",
    });

    setEditingId(student.id);
    setShowAddForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ---------------------------------------------
  // SINGLE DELETE
  // ---------------------------------------------

  async function deleteStudent(student: any) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.student_name}?`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", student.id);

    setDeleting(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("✅ Student deleted successfully.");

    await loadStudents();
  }

  // ---------------------------------------------
  // SELECT / UNSELECT
  // ---------------------------------------------

  function toggleStudent(id: string | number) {
    setSelectedIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter(
          (studentId) => studentId !== id
        );
      }

      return [...previous, id];
    });
  }

  // ---------------------------------------------
  // SELECT ALL CURRENTLY VISIBLE STUDENTS
  // ---------------------------------------------

  function toggleSelectAll() {
    const visibleIds = filteredStudents.map(
      (student) => student.id
    );

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) =>
        selectedIds.includes(id)
      );

    if (allSelected) {
      setSelectedIds((previous) =>
        previous.filter(
          (id) => !visibleIds.includes(id)
        )
      );
    } else {
      setSelectedIds((previous) => [
        ...new Set([
          ...previous,
          ...visibleIds,
        ]),
      ]);
    }
  }

  // ---------------------------------------------
  // BULK DELETE
  // ---------------------------------------------

  async function deleteSelectedStudents() {
    if (selectedIds.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} selected student(s)?`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    const { error } = await supabase
      .from("students")
      .delete()
      .in("id", selectedIds);

    setDeleting(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert(
      `✅ ${selectedIds.length} student(s) deleted successfully.`
    );

    await loadStudents();
  }

  const visibleIds = filteredStudents.map(
    (student) => student.id
  );

  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) =>
      selectedIds.includes(id)
    );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div>
            <h1 className="text-4xl font-bold">
              👨 Students Management
            </h1>

            <p className="text-gray-500 mt-2">
              Total Students: {students.length}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold"
            >
              ➕ Add Student
            </button>

            <Link
              href="/import-students"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-bold"
            >
              📥 Bulk Upload
            </Link>

            <button
              type="button"
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-lg font-bold"
            >
              📄 Download Template
            </button>

          </div>
        </div>

        {/* ADD / EDIT FORM */}

        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">
                {editingId !== null
                  ? "✏️ Edit Student"
                  : "➕ Add Student"}
              </h2>

              <button
                type="button"
                onClick={resetForm}
                className="text-red-600 font-bold text-xl"
              >
                ✕
              </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="font-semibold block mb-2">
                  Student Name *
                </label>

                <input
                  type="text"
                  value={form.student_name}
                  onChange={(e) =>
                    updateForm(
                      "student_name",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg p-3"
                  placeholder="Enter student name"
                />
              </div>

              <div>
                <label className="font-semibold block mb-2">
                  Admission Number *
                </label>

                <input
                  type="text"
                  value={form.admission_no}
                  onChange={(e) =>
                    updateForm(
                      "admission_no",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg p-3"
                  placeholder="Enter admission number"
                />
              </div>

              <div>
                <label className="font-semibold block mb-2">
                  Chest Number
                </label>

                <input
                  type="text"
                  value={form.chest_no}
                  onChange={(e) =>
                    updateForm(
                      "chest_no",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg p-3"
                  placeholder="Enter chest number"
                />
              </div>

              <div>
                <label className="font-semibold block mb-2">
                  Class
                </label>

                <input
                  type="text"
                  value={form.class}
                  onChange={(e) =>
                    updateForm(
                      "class",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg p-3"
                  placeholder="Example: 10A"
                />
              </div>

              <div>
                <label className="font-semibold block mb-2">
                  Category *
                </label>

                <select
  value={form.category}
  onChange={(e) =>
    updateForm(
      "category",
      e.target.value
    )
  }
  className="w-full border rounded-lg p-3"
>
  <option value="">
    Select Category
  </option>

  <option value="Kiddies">
    Kiddies
  </option>

  <option value="Sub-junior">
    Sub-junior
  </option>

  <option value="Junior">
    Junior
  </option>

  <option value="Senior">
    Senior
  </option>
</select>

                
              </div>

              <div>
                <label className="font-semibold block mb-2">
                  Gender *
                </label>

               <select
  value={form.gender}
  onChange={(e) =>
    updateForm(
      "gender",
      e.target.value
    )
  }
  className="w-full border rounded-lg p-3"
>
  <option value="">
    Select Gender
  </option>

  <option value="Boys">
    Boys
  </option>

  <option value="Girls">
    Girls
  </option>
</select>

               
              </div>

             
              <div>
                <label className="font-semibold block mb-2">
                  Team
                </label>

                <select
                  value={form.team}
  onChange={(e) =>
    updateForm(
      "team",
      e.target.value
    )
  }
  className="w-full border rounded-lg p-3"
>
  <option value="">
    Select Team
  </option>

  <option value="DIJLA">
    DIJLA
  </option>

  <option value="FURATH">
    FURATH
  </option>

  <option value="NILE">
    NILE
  </option>

  <option value="SAIHOON">
    SAIHOON
  </option>
</select>
              </div>

            <div className="flex gap-3 mt-6">

              <button
                type="button"
                onClick={saveStudent}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-bold"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "💾 Update Student"
                  : "💾 Save Student"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-bold"
              >
                Cancel
              </button>

            </div>

          </div>

          </div>
        )}

        {/* SEARCH */}

        <div className="mb-6">

          <input
            type="text"
            placeholder="🔍 Search by student name or admission number..."
            className="w-full border rounded-lg p-3"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        {/* BULK ACTION BAR */}

        <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <label className="flex items-center gap-3 font-semibold cursor-pointer">

            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
              className="w-5 h-5"
            />

            Select All
            {filteredStudents.length > 0 &&
              ` (${filteredStudents.length})`}

          </label>

          <button
            type="button"
            onClick={deleteSelectedStudents}
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

        {/* STUDENT TABLE */}

        <div className="bg-white rounded-xl shadow overflow-x-auto">

          <table className="w-full">

            <thead className="bg-blue-900 text-white">

              <tr>

                <th className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="w-5 h-5"
                  />
                </th>

                <th className="p-4 text-left">
                  Admission No
                </th>

                <th className="p-4 text-left">
                  Student Name
                </th>

                <th className="p-4 text-left">
                  Class
                </th>

                <th className="p-4 text-left">
                  Category
                </th>

                <th className="p-4 text-left">
                  Gender
                </th>

                <th className="p-4 text-left">
                  Team
                </th>

                <th className="p-4 text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredStudents.map(
                (student) => (

                  <tr
                    key={student.id}
                    className={`border-b hover:bg-gray-50 ${
                      selectedIds.includes(
                        student.id
                      )
                        ? "bg-red-50"
                        : ""
                    }`}
                  >

                    <td className="p-4 text-center">

                      <input
                        type="checkbox"
                        checked={selectedIds.includes(
                          student.id
                        )}
                        onChange={() =>
                          toggleStudent(
                            student.id
                          )
                        }
                        className="w-5 h-5"
                      />

                    </td>

                    <td className="p-4">
                      {student.admission_no}
                    </td>

                    <td className="p-4 font-semibold">
                      {student.student_name}
                    </td>

                    <td className="p-4">
                      {student.class}
                    </td>

                    <td className="p-4">
                      {student.category}
                    </td>

                    <td className="p-4">
                      {student.gender}
                    </td>

                    <td className="p-4">
                      {student.team}
                    </td>

                    <td className="p-4 text-center whitespace-nowrap">

                      <button
                        type="button"
                        onClick={() =>
                          editStudent(student)
                        }
                        className="text-blue-600 hover:text-blue-800 mr-4 font-semibold"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteStudent(
                            student
                          )
                        }
                        disabled={deleting}
                        className="text-red-600 hover:text-red-800 disabled:text-gray-400 font-semibold"
                      >
                        🗑️ Delete
                      </button>

                    </td>

                  </tr>

                )
              )}

              {filteredStudents.length ===
                0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-8 text-center text-gray-500"
                  >
                    No students found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>
    </DashboardLayout>
  );
}
