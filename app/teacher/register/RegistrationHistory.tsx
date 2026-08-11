"use client";

import { supabase } from "@/lib/supabase";

interface Props {
  teacherId: string;
  registrations: any[];
  refresh: () => void;
}

export default function RegistrationHistory({
  teacherId,
  registrations,
  refresh,
}: Props) {

  async function deleteRegistration(id: number) {

    const ok = confirm("Delete this registration?");

    if (!ok) return;

    const { error } = await supabase
      .from("registrations")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    refresh();

  }

  return (

    <div className="bg-white rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-5">
        📋 My Registrations
      </h2>

      <table className="w-full border">

        <thead className="bg-gray-100">

          <tr>

            <th className="border p-2">Student</th>

            <th className="border p-2">Programme</th>

            <th className="border p-2">Team</th>

            <th className="border p-2">Action</th>

          </tr>

        </thead>

        <tbody>

          {registrations.map((r) => (

            <tr key={r.id}>

              <td className="border p-2">
                {r.student_name}
              </td>

              <td className="border p-2">
                {r.programme_name}
              </td>

              <td className="border p-2">
                {r.team}
              </td>

              <td className="border p-2 text-center">

                <button
                  onClick={() => deleteRegistration(r.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}