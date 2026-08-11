"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function ProgrammesPage() {
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    programme_name: "",
    category: "",
    programme_type: "",
    duration: "",
  });

  useEffect(() => {
    loadProgrammes();
  }, []);

  async function loadProgrammes() {
    const { data, error } = await supabase
      .from("programmes")
      .select("*")
      .order("programme_name");

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setProgrammes(data || []);
  }

  function updateForm(field: string, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm({
      programme_name: "",
      category: "",
      programme_type: "",
      duration: "",
    });

    setEditingId(null);
    setShowForm(false);
  }

  function editProgramme(programme: any) {
    setForm({
      programme_name: programme.programme_name || "",
      category: programme.category || "",
      programme_type: programme.programme_type || "",
      duration: programme.duration?.toString() || "",
    });

    setEditingId(programme.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveProgramme() {
    if (!form.programme_name.trim()) {
      alert("Please enter programme name.");
      return;
    }

    if (!form.category) {
      alert("Please select category.");
      return;
    }

    if (!form.programme_type) {
      alert("Please select programme type.");
      return;
    }

    setSaving(true);

    const programmeData = {
      programme_name: form.programme_name.trim(),
      category: form.category,
      programme_type: form.programme_type,
      duration: form.duration.trim(),
    };

    let error;

    if (editingId !== null) {
      const result = await supabase
        .from("programmes")
        .update(programmeData)
        .eq("id", editingId);

      error = result.error;
    } else {
      const result = await supabase
        .from("programmes")
        .insert(programmeData);

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
        ? "✅ Programme updated successfully."
        : "✅ Programme added successfully."
    );

    resetForm();
    loadProgrammes();
  }

  async function deleteProgramme(programme: any) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${programme.programme_name}"?`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("programmes")
      .delete()
      .eq("id", programme.id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("✅ Programme deleted successfully.");

    loadProgrammes();
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-4xl font-bold">
              🎭 Programmes Management
            </h1>

            <p className="text-gray-500 mt-2">
              Total Programmes: {programmes.length}
            </p>
          </div>

          <div className="flex gap-3">

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold"
            >
              ➕ Add Programme
            </button>

            <Link
              href="/import-programmes"
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
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">
                {editingId !== null
                  ? "✏️ Edit Programme"
                  : "➕ Add Programme"}
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

              {/* PROGRAMME NAME */}
              <div>
                <label className="font-semibold block mb-2">
                  Programme Name *
                </label>

                <input
                  type="text"
                  value={form.programme_name}
                  onChange={(e) =>
                    updateForm("programme_name", e.target.value)
                  }
                  className="w-full border rounded-lg p-3"
                  placeholder="Enter programme name"
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label className="font-semibold block mb-2">
                  Category *
                </label>

               <select
  value={form.category}
  onChange={(e) =>
    updateForm("category", e.target.value)
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

              {/* TYPE */}
              <div>
                <label className="font-semibold block mb-2">
                  Programme Type *
                </label>

                <select
  value={form.programme_type}
  onChange={(e) =>
    updateForm("programme_type", e.target.value)
  }
  className="w-full border rounded-lg p-3"
>
  <option value="">
    Select Type
  </option>

  <option value="Individual">
    Individual
  </option>

  <option value="Group">
    Group
  </option>

  <option value="Team">
    Team
  </option>
</select>
              </div>

              {/* DURATION */}
              <div>
                <label className="font-semibold block mb-2">
                  Duration
                </label>

                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) =>
                    updateForm("duration", e.target.value)
                  }
                  className="w-full border rounded-lg p-3"
                  placeholder="Example: 5 minutes"
                />
              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 mt-6">

              <button
                type="button"
                onClick={saveProgramme}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-bold"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "💾 Update Programme"
                  : "💾 Save Programme"}
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
        )}

        {/* PROGRAMMES TABLE */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">

          <table className="w-full">

            <thead className="bg-blue-900 text-white">

              <tr>

                <th className="p-4 text-left">
                  Programme Name
                </th>

                <th className="p-4 text-left">
                  Category
                </th>

                <th className="p-4 text-left">
                  Type
                </th>

                <th className="p-4 text-left">
                  Duration
                </th>

                <th className="p-4 text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {programmes.map((programme) => (

                <tr
                  key={programme.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-4 font-semibold">
                    {programme.programme_name}
                  </td>

                  <td className="p-4">
                    {programme.category}
                  </td>

                  <td className="p-4">
                    {programme.programme_type}
                  </td>

                  <td className="p-4">
                    {programme.duration || "-"}
                  </td>

                  <td className="p-4 text-center">

                    {/* EDIT */}
                    <button
                      type="button"
                      onClick={() => editProgramme(programme)}
                      className="text-blue-600 hover:text-blue-800 mr-4 font-semibold"
                    >
                      ✏️ Edit
                    </button>

                    {/* DELETE */}
                    <button
                      type="button"
                      onClick={() => deleteProgramme(programme)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      🗑️ Delete
                    </button>

                  </td>

                </tr>

              ))}

              {programmes.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-gray-500"
                  >
                    No programmes found.
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

