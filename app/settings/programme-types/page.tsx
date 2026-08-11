"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function ProgrammeTypesPage() {
  const [types, setTypes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTypes();
  }, []);

  async function loadTypes() {
    const { data, error } = await supabase
      .from("programme_types")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setTypes(data || []);
  }

  function startAdd() {
    setName("");
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(type: any) {
    setName(type.name || "");
    setEditingId(type.id);
    setShowForm(true);
  }

  function cancelForm() {
    setName("");
    setEditingId(null);
    setShowForm(false);
  }

  async function saveType() {
    if (!name.trim()) {
      alert("Please enter programme type.");
      return;
    }

    setSaving(true);

    let error;

    if (editingId !== null) {
      const result = await supabase
        .from("programme_types")
        .update({
          name: name.trim(),
        })
        .eq("id", editingId);

      error = result.error;
    } else {
      const result = await supabase
        .from("programme_types")
        .insert({
          name: name.trim(),
        });

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
        ? "✅ Programme type updated successfully."
        : "✅ Programme type added successfully."
    );

    cancelForm();
    loadTypes();
  }

  async function deleteType(type: any) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${type.name}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("programme_types")
      .delete()
      .eq("id", type.id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("✅ Programme type deleted successfully.");
    loadTypes();
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              🎭 Programme Types
            </h1>

            <p className="text-gray-500 mt-2">
              Manage programme types for MUNAFASA
            </p>
          </div>

          <button
            type="button"
            onClick={startAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold"
          >
            ➕ Add Programme Type
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

            <h2 className="text-2xl font-bold mb-5">
              {editingId !== null
                ? "✏️ Edit Programme Type"
                : "➕ Add Programme Type"}
            </h2>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter programme type"
              className="w-full border rounded-lg p-3 mb-4"
            />

            <div className="flex gap-3">

              <button
                type="button"
                onClick={saveType}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "💾 Update"
                  : "💾 Save"}
              </button>

              <button
                type="button"
                onClick={cancelForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                Cancel
              </button>

            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="p-4 text-left">
                  Programme Type
                </th>

                <th className="p-4 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {types.map((type) => (
                <tr
                  key={type.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4 font-semibold">
                    {type.name}
                  </td>

                  <td className="p-4 text-center">

                    <button
                      type="button"
                      onClick={() => startEdit(type)}
                      className="text-blue-600 hover:text-blue-800 mr-5 font-semibold"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteType(type)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      🗑️ Delete
                    </button>

                  </td>
                </tr>
              ))}

              {types.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="p-8 text-center text-gray-500"
                  >
                    No programme types found.
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