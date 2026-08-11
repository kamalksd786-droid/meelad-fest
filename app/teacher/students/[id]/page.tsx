"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Student {
  id: number;
  admission_no: string;
  student_name: string;
  class: string;
  category: string;
  team: string;
}

interface Programme {
  id: number;
  programme_code: string;
  programme_name: string;
  programme_type: string;
  participant_type: string;
  category: string;
}

export default function StudentProgrammePage() {
  const params = useParams();
  const studentId = Number(params.id);

  const [student, setStudent] = useState<Student | null>(null);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("Stage");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);

    const { data: studentData, error: studentError } =
      await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();

    if (studentError || !studentData) {
      console.error("Student loading error:", studentError);
      setLoading(false);
      return;
    }

    setStudent(studentData);

    await loadProgrammes(studentData.category);
    await loadRegistrations();

    setLoading(false);
  }

  async function loadProgrammes(category: string) {
    const { data, error } = await supabase
      .from("programmes")
      .select("*")
      .eq("category", category)
      .order("programme_code");

    if (error) {
      console.error("Programme loading error:", error);
      return;
    }

    setProgrammes(data || []);
  }

  async function loadRegistrations() {
    const { data, error } = await supabase
      .from("registrations")
      .select("programme_id")
      .eq("student_id", studentId);

    if (error) {
      console.error("Registration loading error:", error);
      return;
    }

    if (data) {
      setSelected(
        data.map((registration) => registration.programme_id)
      );
    }
  }

  function toggleProgramme(id: number) {
    if (selected.includes(id)) {
      setSelected(
        selected.filter((programmeId) => programmeId !== id)
      );
    } else {
      setSelected([...selected, id]);
    }
  }

  async function saveProgrammes() {
    if (!student) return;

    setSaving(true);

    const { error: deleteError } = await supabase
      .from("registrations")
      .delete()
      .eq("student_id", studentId);

    if (deleteError) {
      alert(deleteError.message);
      setSaving(false);
      return;
    }

    const rows = selected.map((programme_id) => {
      const programme = programmes.find(
        (item) => item.id === programme_id
      );

      return {
        student_id: studentId,
        programme_id,
        admission_no: student.admission_no,
        student_name: student.student_name,
        class: student.class,
        team: student.team,
        category: student.category,
        programme_code: programme?.programme_code,
        programme_name: programme?.programme_name,
        participant_type: programme?.participant_type,
        event_type: programme?.programme_type,
        status: "Registered",
      };
    });

    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from("registrations")
        .insert(rows);

      if (insertError) {
        alert(insertError.message);
        setSaving(false);
        return;
      }
    }

    alert("✅ Programmes Saved");

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-10">
        Student not found.
      </div>
    );
  }

  const filteredProgrammes = programmes.filter((programme) => {
    const matchesType =
      programme.programme_type === activeTab;

    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      programme.programme_name
        .toLowerCase()
        .includes(searchText) ||
      programme.programme_code
        .toLowerCase()
        .includes(searchText);

    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <div className="bg-purple-800 text-white shadow">

        <div className="max-w-7xl mx-auto px-6 py-5">

          <h1 className="text-3xl font-bold">
            Programme Assignment
          </h1>

        </div>

      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* STUDENT CARD */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

            <div>
              <p className="text-gray-500 text-sm">
                Admission No
              </p>

              <h3 className="font-bold">
                {student.admission_no}
              </h3>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Student Name
              </p>

              <h3 className="font-bold">
                {student.student_name}
              </h3>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Class
              </p>

              <h3 className="font-bold">
                {student.class}
              </h3>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Category
              </p>

              <h3 className="font-bold">
                {student.category}
              </h3>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Team
              </p>

              <h3 className="font-bold uppercase">
                {student.team}
              </h3>
            </div>

          </div>

        </div>

        {/* TABS */}

        <div className="flex flex-wrap gap-3 mb-6">

          {[
            "Stage",
            "Off Stage",
            "Group",
            "General",
          ].map((tab) => (

            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? "bg-purple-700 text-white"
                  : "bg-white shadow"
              }`}
            >
              {tab}
            </button>

          ))}

        </div>

        {/* SEARCH */}

        <input
          type="text"
          placeholder="Search Programme..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 border rounded-lg p-3 mb-6"
        />

        {/* PROGRAMME GRID */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {filteredProgrammes.length === 0 ? (

            <div className="col-span-full bg-white rounded-xl shadow p-10 text-center text-gray-500">
              No programmes found.
            </div>

          ) : (

            filteredProgrammes.map((programme) => (

              <label
                key={programme.id}
                className={`cursor-pointer rounded-xl border-2 p-5 transition ${
                  selected.includes(programme.id)
                    ? "border-purple-700 bg-purple-50"
                    : "border-gray-200 bg-white hover:border-purple-300"
                }`}
              >

                <div className="flex items-start gap-3">

                  <input
                    type="checkbox"
                    checked={selected.includes(programme.id)}
                    onChange={() =>
                      toggleProgramme(programme.id)
                    }
                    className="mt-1 h-5 w-5"
                  />

                  <div className="flex-1">

                    <h3 className="font-bold text-lg">
                      {programme.programme_name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Code : {programme.programme_code}
                    </p>

                    <p className="text-sm text-gray-500">
                      Participant :{" "}
                      {programme.participant_type}
                    </p>

                  </div>

                </div>

              </label>

            ))

          )}

        </div>

        {/* FOOTER */}

        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="text-lg font-semibold">

            Selected Programmes :

            <span className="ml-2 text-purple-700">
              {selected.length}
            </span>

          </div>

          <button
            type="button"
            onClick={saveProgrammes}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-bold"
          >
            {saving ? "Saving..." : "Save Programmes"}
          </button>

        </div>

      </div>

    </div>
  );
}