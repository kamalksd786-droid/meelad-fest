"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function PointRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    position: "",
    points: "",
    description: "",
  });

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    const { data, error } = await supabase
      .from("point_rules")
      .select("*")
      .order("position");

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setRules(data || []);
  }

  function updateForm(field: string, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function startAdd() {
    setForm({
      position: "",
      points: "",
      description: "",
    });

    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(rule: any) {
    setForm({
      position: rule.position?.toString() || "",
      points: rule.points?.toString() || "",
      description: rule.description || "",
    });

    setEditingId(rule.id);
    setShowForm(true);
  }

  function cancelForm() {
    setForm({
      position: "",
      points: "",
      description: "",
    });

    setEditingId(null);
    setShowForm(false);
  }

  async function saveRule() {
    if (!form.position.trim()) {
      alert("Please enter position.");
      return;
    }

    if (!form.points.trim()) {
      alert("Please enter points.");
      return;
    }

    setSaving(true);

    const ruleData = {
      position: Number(form.position),
      points: Number(form.points),
      description: form.description.trim(),
    };

    let error;

    if (editingId !== null) {
      const result = await supabase
        .from("point_rules")
        .update(ruleData)
        .eq("id", editingId);

      error = result.error;
    } else {
      const result = await supabase
        .from("point_rules")
        .insert(ruleData);

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
        ? "✅ Point rule updated successfully."
        : "✅ Point rule added successfully."
    );

    cancelForm();
    loadRules();
  }

  async function deleteRule(rule: any) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the rule for position ${rule.position}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("point_rules")
      .delete()
      .eq("id", rule.id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("✅ Point rule deleted successfully.");

    loadRules();
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-4xl font-bold">
              ⭐ Point Rules
            </h1>

            <p className="text-gray-500 mt-2">
              Manage scoring rules for MUNAFASA
            </p>
          </div>

          <button
            type="button"
            onClick={startAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold"
          >
            ➕ Add Point Rule
          </button>

        </div>

        {/* ADD / EDIT FORM */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

            <h2 className="text-2xl font-bold mb-6">
              {editingId !== null
                ? "✏️ Edit Point Rule"
                : "➕ Add Point Rule"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* POSITION */}
              <div>
                <label className="font-semibold block mb-2">
                  Position *
                </label>

                <input
                  type="number"
                  min="1"
                  value={form.position}
                  onChange={(e) =>
                    updateForm("position", e.target.value)
                  }
                  className="w-full border rounded-lg p-3"
                  placeholder="Example: 1"
                />
              </div>

              {/* POINTS */}
              <div>
                <label className="font-semibold block mb-2">
                  Points *
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.points}
                  onChange={(e) =>
                    updateForm("points", e.target.value)
                  }
                  className="w-full border rounded-lg p-3"
                  placeholder="Example: 5"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="font-semibold block mb-2">
                  Description
                </label>

                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    updateForm("description", e.target.value)
                  }
                  className="w-full border rounded-lg p-3"
                  placeholder="Example: First Position"
                />
              </div>

            </div>

            <div className="flex gap-3 mt-6">

              <button
                type="button"
                onClick={saveRule}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-bold"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "💾 Update Rule"
                  : "💾 Save Rule"}
              </button>

              <button
                type="button"
                onClick={cancelForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-bold"
              >
                Cancel
              </button>

            </div>

          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-blue-900 text-white">

              <tr>

                <th className="p-4 text-left">
                  Position
                </th>

                <th className="p-4 text-left">
                  Points
                </th>

                <th className="p-4 text-left">
                  Description
                </th>

                <th className="p-4 text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {rules.map((rule) => (

                <tr
                  key={rule.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-4 font-semibold">
                    {rule.position}
                  </td>

                  <td className="p-4 font-semibold">
                    {rule.points}
                  </td>

                  <td className="p-4">
                    {rule.description || "-"}
                  </td>

                  <td className="p-4 text-center">

                    <button
                      type="button"
                      onClick={() => startEdit(rule)}
                      className="text-blue-600 hover:text-blue-800 mr-5 font-semibold"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteRule(rule)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      🗑️ Delete
                    </button>

                  </td>

                </tr>

              ))}

              {rules.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-gray-500"
                  >
                    No point rules found.
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