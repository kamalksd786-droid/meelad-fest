"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type Programme = {
  id: number;
  programme_name: string;
  programme_code: string;
  category: string | null;
};

type Participant = {
  id: number;
  admission_no: string | null;
  student_name: string | null;
  class: string | null;
  team: string | null;
};

export default function JudgeProgrammePage() {
  const params = useParams();
  const router = useRouter();

  const programmeId = Number(params.programmeId);

  const [programme, setProgramme] =
    useState<Programme | null>(null);

  const [participants, setParticipants] =
    useState<Participant[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const storedJudge =
      localStorage.getItem("judge");

    if (!storedJudge) {
      router.push("/judge-login");
      return;
    }

    // Load programme
    const {
      data: programmeData,
      error: programmeError,
    } = await supabase
      .from("programmes")
      .select("*")
      .eq("id", programmeId)
      .single();

    if (programmeError) {
      console.error(
        "Programme loading error:",
        programmeError
      );
    }

    setProgramme(programmeData);

    // Load participants
    const {
      data: participantData,
      error: participantError,
    } = await supabase
      .from("registrations")
      .select("*")
      .eq("programme_id", programmeId)
      .order("student_name");

    if (participantError) {
      console.error(
        "Participant loading error:",
        participantError
      );
    }

    setParticipants(
      participantData || []
    );

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-green-950 text-white p-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-8">

          <div>

            <h1 className="text-4xl font-bold text-yellow-400">
              {programme?.programme_name}
            </h1>

            <p className="mt-2">
              <strong>Code:</strong>{" "}
              {programme?.programme_code}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {programme?.category || "-"}
            </p>

          </div>

          <Link
            href="/judge-dashboard"
            className="bg-gray-700 hover:bg-gray-800 px-5 py-3 rounded-lg"
          >
            ← Back
          </Link>

        </div>

        {/* PARTICIPANTS */}

        <div className="bg-green-900 rounded-xl p-6">

          <h2 className="text-2xl font-bold mb-6">
            Participants ({participants.length})
          </h2>

          {participants.length === 0 ? (

            <div className="bg-yellow-100 text-black rounded-lg p-5">
              No participants registered.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="bg-green-800">

                    <th className="p-3 text-left">
                      Admission No
                    </th>

                    <th className="p-3 text-left">
                      Student Name
                    </th>

                    <th className="p-3 text-left">
                      Class
                    </th>

                    <th className="p-3 text-left">
                      Team
                    </th>

                    <th className="p-3 text-center">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {participants.map(
                    (student) => (

                      <tr
                        key={student.id}
                        className="border-b border-green-700"
                      >

                        <td className="p-3">
                          {student.admission_no || "-"}
                        </td>

                        <td className="p-3 font-semibold">
                          {student.student_name || "-"}
                        </td>

                        <td className="p-3">
                          {student.class || "-"}
                        </td>

                        <td className="p-3">
                          {student.team || "-"}
                        </td>

                        <td className="p-3 text-center">

                          <p className="text-yellow-300 mb-2">
                            ID: {student.id}
                          </p>

                          <Link
                            href={`/judge-score/${student.id}`}
                            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-bold"
                          >
                            Enter Marks
                          </Link>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}