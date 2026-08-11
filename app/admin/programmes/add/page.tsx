"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AddProgrammePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    programme_code: "",
    programme_name: "",
    programme_type: "Stage",
    participant_type: "Single",
    category: "Junior",
    is_active: true,
  });

  const [saving, setSaving] = useState(false);

  async function saveProgramme(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    const { error } = await supabase
      .from("programmes")
      .insert([form]);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Programme Added Successfully");

    router.push("/admin/programmes");
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}

      <div className="bg-purple-800 text-white p-6">

        <div className="max-w-5xl mx-auto">

          <h1 className="text-3xl font-bold">
            Add Programme
          </h1>

        </div>

      </div>

      <div className="max-w-3xl mx-auto mt-8">

        <form
          onSubmit={saveProgramme}
          className="bg-white rounded-xl shadow p-8 space-y-6"
        >

          <div>

            <label className="font-semibold">
              Programme Code
            </label>

            <input
              className="w-full border rounded-lg p-3 mt-2"
              value={form.programme_code}
              onChange={(e) =>
                setForm({
                  ...form,
                  programme_code: e.target.value,
                })
              }
              required
            />

          </div>

          <div>

            <label className="font-semibold">
              Programme Name
            </label>

            <input
              className="w-full border rounded-lg p-3 mt-2"
              value={form.programme_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  programme_name: e.target.value,
                })
              }
              required
            />

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <label className="font-semibold">
                Programme Type
              </label>

              <select
                className="w-full border rounded-lg p-3 mt-2"
                value={form.programme_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    programme_type: e.target.value,
                  })
                }
              >
                <option>Stage</option>
                <option>Off Stage</option>
                <option>Group</option>
                <option>General</option>
              </select>

            </div>

            <div>

              <label className="font-semibold">
                Participant Type
              </label>

              <select
                className="w-full border rounded-lg p-3 mt-2"
                value={form.participant_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    participant_type: e.target.value,
                  })
                }
              >
                <option>Single</option>
                <option>Group</option>
              </select>

            </div>

          </div>

          <div>

            <label className="font-semibold">
              Category
            </label>

            <select
              className="w-full border rounded-lg p-3 mt-2"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
            >
              <option>Kiddies</option>
              <option>Sub Junior</option>
              <option>Junior</option>
              <option>Senior</option>

            </select>

          </div>

          <div className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({
                  ...form,
                  is_active: e.target.checked,
                })
              }
            />

            <label>Active Programme</label>

          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-bold"
          >
            {saving ? "Saving..." : "Save Programme"}
          </button>

        </form>

      </div>

    </div>
  );
}
