"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import BackButton from "../components/layout/BackButton";
import { supabase } from "@/lib/supabase";

type Template = {
  id: number;
  template_name: string;
  total_marks: number;
};

export default function MarkingTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    const { data, error } = await supabase
      .from("marking_templates")
      .select("*")
      .order("template_name");

    if (error) {
      console.error("Template loading error:", error);
      alert(error.message);
      return;
    }

    setTemplates(data || []);
  }

  async function saveTemplate() {
    if (!templateName.trim()) {
      alert("Please enter Template Name.");
      return;
    }

    if (totalMarks <= 0) {
      alert("Total marks must be greater than 0.");
      return;
    }

    const { error } = await supabase
      .from("marking_templates")
      .insert({
        template_name: templateName.trim(),
        total_marks: totalMarks,
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("✅ Template Saved");

    setTemplateName("");
    setTotalMarks(100);

    loadTemplates();
  }

  async function deleteTemplate(id: number) {
    if (!confirm("Delete this template?")) {
      return;
    }

    const { error } = await supabase
      .from("marking_templates")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadTemplates();
  }

  return (
    <DashboardLayout>
      <BackButton />

      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          📝 Marking Templates
        </h1>

        <p className="text-gray-500 mt-2">
          Create and manage marking templates
        </p>
      </div>

      {/* ADD TEMPLATE */}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

        <h2 className="text-2xl font-bold mb-5">
          Add Marking Template
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block font-semibold mb-2">
              Template Name
            </label>

            <input
              type="text"
              value={templateName}
              onChange={(e) =>
                setTemplateName(e.target.value)
              }
              placeholder="Example: General Programme"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Total Marks
            </label>

            <input
              type="number"
              min="1"
              value={totalMarks}
              onChange={(e) =>
                setTotalMarks(Number(e.target.value))
              }
              className="w-full border rounded-lg p-3"
            />
          </div>

        </div>

        <button
          type="button"
          onClick={saveTemplate}
          className="mt-5 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-bold"
        >
          ➕ Save Template
        </button>

      </div>

      {/* TEMPLATE LIST */}

      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">

        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">
            Existing Templates
          </h2>
        </div>

        {templates.length === 0 ? (

          <div className="p-8 text-center text-gray-500">
            No marking templates found.
          </div>

        ) : (

          <table className="w-full">

            <thead className="bg-green-900 text-white">

              <tr>

                <th className="p-4 text-left">
                  ID
                </th>

                <th className="p-4 text-left">
                  Template Name
                </th>

                <th className="p-4 text-left">
                  Total Marks
                </th>

                <th className="p-4 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {templates.map((template) => (

                <tr
                  key={template.id}
                  className="border-b hover:bg-green-50"
                >

                  <td className="p-4">
                    {template.id}
                  </td>

                  <td className="p-4 font-semibold">
                    {template.template_name}
                  </td>

                  <td className="p-4">
                    {template.total_marks}
                  </td>

                  <td className="p-4 text-center">

                    <button
                      type="button"
                      onClick={() =>
                        deleteTemplate(template.id)
                      }
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
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