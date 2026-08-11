"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setCategories(data || []);
  }

  function startAdd() {
    setName("");
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(category: any) {
    setName(category.name || "");
    setEditingId(category.id);
    setShowForm(true);
  }

  function cancelForm() {
    setName("");
    setEditingId(null);
    setShowForm(false);
  }

  async function saveCategory() {
    if (!name.trim()) {
      alert("Please enter category name.");
      return;
    }

    setSaving(true);

    let error;

    if (editingId !== null) {
      const result = await supabase
        .from("categories")
        .update({
          name: name.trim(),
        })
        .eq("id", editingId);

      error = result.error;
    } else {
      const result = await supabase
        .from("categories")
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
        ? "✅ Category updated successfully."
        : "✅ Category added successfully."
    );

    cancelForm();
    loadCategories();
  }

  async function deleteCategory(category: any) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("✅ Category deleted successfully.");
    loadCategories();
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              🎓 Competition Categories
            </h1>

            <p className="text-gray-500 mt-2">
              Manage MUNAFASA competition categories
            </p>
          </div>

          <button
            type="button"
            onClick={startAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold"
          >
            ➕ Add Category
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

            <h2 className="text-2xl font-bold mb-5">
              {editingId !== null
                ? "✏️ Edit Category"
                : "➕ Add Category"}
            </h2>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className="w-full border rounded-lg p-3 mb-4"
            />

            <div className="flex gap-3">

              <button
                type="button"
                onClick={saveCategory}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "💾 Update Category"
                  : "💾 Save Category"}
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
                  Category
                </th>

                <th className="p-4 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4 font-semibold">
                    {category.name}
                  </td>

                  <td className="p-4 text-center">

                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="text-blue-600 hover:text-blue-800 mr-5 font-semibold"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteCategory(category)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      🗑️ Delete
                    </button>

                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="p-8 text-center text-gray-500"
                  >
                    No categories found.
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