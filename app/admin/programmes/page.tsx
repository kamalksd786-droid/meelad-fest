"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Programme {
  id: number;
  programme_code: string;
  programme_name: string;
  programme_type: string;
  participant_type: string;
  category: string;
  is_active: boolean;
}

export default function ProgrammePage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgrammes();
  }, []);

  async function loadProgrammes() {
    setLoading(true);

    const { data } = await supabase
      .from("programmes")
      .select("*")
      .order("programme_code");

    if (data) {
      setProgrammes(data);
    }

    setLoading(false);
  }

  async function deleteProgramme(id: number) {
    if (!confirm("Delete this programme?")) return;

    await supabase
      .from("programmes")
      .delete()
      .eq("id", id);

    loadProgrammes();
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-purple-800 text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            Programme Management
          </h1>

          <Link
            href="/admin/programmes/add"
            className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-lg"
          >
            + Add Programme
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">

        <div className="bg-white rounded-xl shadow overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-200">

              <tr>

                <th className="p-3">Code</th>
                <th className="p-3">Programme</th>
                <th className="p-3">Type</th>
                <th className="p-3">Participant</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={7}
                    className="text-center p-10"
                  >
                    Loading...
                  </td>

                </tr>

              ) : (

                programmes.map((programme) => (

                  <tr
                    key={programme.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="p-3">
                      {programme.programme_code}
                    </td>

                    <td className="p-3">
                      {programme.programme_name}
                    </td>

                    <td className="p-3">
                      {programme.programme_type}
                    </td>

                    <td className="p-3">
                      {programme.participant_type}
                    </td>

                    <td className="p-3">
                      {programme.category}
                    </td>

                    <td className="p-3">
                      {programme.is_active ? (
                        <span className="text-green-600 font-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="p-3 flex gap-2">

                      <Link
                        href={`/admin/programmes/edit/${programme.id}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => deleteProgramme(programme.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}