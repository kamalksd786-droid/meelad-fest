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

const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>("");
const [registeredStudents, setRegisteredStudents] = useState<any[]>([]);
const [loadingRegisteredStudents, setLoadingRegisteredStudents] = useState(false);
  const [search, setSearch] = useState("");

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
      .order("id", { ascending: true })

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
// ==========================================
// LOAD STUDENTS REGISTERED FOR A PROGRAMME
// ==========================================

async function loadRegisteredStudents(programme: any) {
  setSelectedProgrammeId(String(programme.id));
  setRegisteredStudents([]);
  setLoadingRegisteredStudents(true);

  try {
    // Get all registrations for this programme
   const { data: registrationData, error: registrationError } =
  await supabase
    .from("registrations")
    .select("id, admission_no, programme_id, programme_name")
    .eq("programme_id", programme.id)
    .order("id", { ascending: true });

    if (registrationError) {
      console.error("Registration loading error:", registrationError);
      alert(registrationError.message);
      return;
    }

    if (!registrationData || registrationData.length === 0) {
      setRegisteredStudents([]);
      return;
    }

    // Get admission numbers of registered students
    const admissionNumbers = Array.from(
      new Set(
        registrationData
          .map((registration) =>
            String(registration.admission_no ?? "").trim()
          )
          .filter(Boolean)
      )
    );

    if (admissionNumbers.length === 0) {
      setRegisteredStudents([]);
      return;
    }

    // Load students in batches so we do not hit Supabase's 1000-row limit
    const batchSize = 1000;
    const studentResults: any[] = [];

    for (let i = 0; i < admissionNumbers.length; i += batchSize) {
      const batch = admissionNumbers.slice(i, i + batchSize);

      const { data: studentData, error: studentError } =
        await supabase
          .from("students")
          .select(
            "id, admission_no, student_name, class, division, team, category, gender"
          )
          .in("admission_no", batch)
          .order("class")
          .order("division")
          .order("student_name");

      if (studentError) {
        console.error("Student loading error:", studentError);
        alert(studentError.message);
        return;
      }

      if (studentData) {
        studentResults.push(...studentData);
      }
    }

    // Remove duplicate students if a registration appears more than once
    const uniqueStudents = Array.from(
      new Map(
        studentResults.map((student) => [
          String(student.admission_no).trim(),
          student,
        ])
      ).values()
    );

    setRegisteredStudents(uniqueStudents);
  } catch (error) {
    console.error("Failed to load registered students:", error);
    alert("Failed to load registered students.");
  } finally {
    setLoadingRegisteredStudents(false);
  }
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
function downloadTemplate() {
  const headers = [
    "Programme Name",
    "Category",
    "Programme Type",
    "Duration",
  ];

  const sampleRow = [
    "Example Programme",
    "Junior",
    "Individual",
    "5 minutes",
  ];

  const csvContent = [
    headers.join(","),
    sampleRow.join(","),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "programmes-template.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
const filteredProgrammes = programmes.filter((programme) => {
  const searchText = search.trim().toLowerCase();

  if (!searchText) {
    return true;
  }

  const programmeId = String(programme.id).toLowerCase();
  const programmeName = String(
    programme.programme_name || ""
  ).toLowerCase();

  return (
    programmeId.includes(searchText) ||
    programmeName.includes(searchText)
  );
});
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
  onClick={downloadTemplate}
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
{/* SEARCH PROGRAMME - REGISTERED STUDENTS */}

<div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
  <h2 className="text-xl font-bold text-gray-800 mb-4">
    🔎 Search Programme & Registered Students
  </h2>

  <input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search by Programme ID or Programme Name..."
    className="w-full border rounded-lg p-3"
  />

  {search && (
    <div className="mt-4">
      {filteredProgrammes.length === 0 ? (
        <p className="text-red-500 font-medium">
          No programme found.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredProgrammes.map((programme) => (
            <div
              key={programme.id}
              className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div>
                <p className="font-bold text-gray-800">
                  {programme.id} — {programme.programme_name}
                </p>

                <p className="text-sm text-gray-500">
                  {programme.category} • {programme.programme_type}
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadRegisteredStudents(programme)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
              >
                View Registered Students
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</div>
{/* REGISTERED STUDENTS REPORT */}

{selectedProgrammeId && (
  <div
    id="registered-students-report"
    className="bg-white rounded-2xl shadow-lg p-6 mb-8"
  >
    {(() => {
      const selectedProgramme = programmes.find(
        (programme) =>
          String(programme.id) === selectedProgrammeId
      );

      return (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                👨‍🎓 Registered Students
              </h2>

              {selectedProgramme && (
                <div className="mt-2">
                  <p className="font-semibold text-gray-700">
                    Programme ID: {selectedProgramme.id}
                  </p>

                  <p className="font-semibold text-gray-700">
                    Programme: {selectedProgramme.programme_name}
                  </p>

                  <p className="text-gray-500">
                    Category: {selectedProgramme.category} | Type:{" "}
                    {selectedProgramme.programme_type}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
              >
                🖨️ Print
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
              >
                📄 PDF
              </button>
            </div>
          </div>

          {loadingRegisteredStudents ? (
            <div className="text-center py-8 text-gray-500">
              Loading registered students...
            </div>
          ) : registeredStudents.length === 0 ? (
            <div className="text-center py-8 text-red-500 font-medium">
              No students registered for this programme.
            </div>
          ) : (
            <>
              <div className="mb-4">
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                  Total Students: {registeredStudents.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-3 text-left">Sl. No.</th>
                      <th className="border p-3 text-left">
                        Admission No.
                      </th>
                      <th className="border p-3 text-left">
                        Student Name
                      </th>
                      <th className="border p-3 text-left">Class</th>
                      <th className="border p-3 text-left">
                        Division
                      </th>
                      <th className="border p-3 text-left">Team</th>
                      <th className="border p-3 text-left">
                        Category
                      </th>
                      <th className="border p-3 text-left">Gender</th>
                    </tr>
                  </thead>

                  <tbody>
                    {registeredStudents.map((student, index) => (
                      <tr
                        key={`${student.admission_no}-${index}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="border p-3">
                          {index + 1}
                        </td>

                        <td className="border p-3 font-medium">
                          {student.admission_no || "-"}
                        </td>

                        <td className="border p-3 font-medium">
                          {student.student_name || "-"}
                        </td>

                        <td className="border p-3">
                          {student.class || "-"}
                        </td>

                        <td className="border p-3">
                          {student.division || "-"}
                        </td>

                        <td className="border p-3">
                          {student.team || "-"}
                        </td>

                        <td className="border p-3">
                          {student.category || "-"}
                        </td>

                        <td className="border p-3">
                          {student.gender || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      );
    })()}
  </div>
)}
        {/* PROGRAMMES TABLE */}

<div id="programme-report" className="bg-white rounded-xl shadow overflow-x-auto">

          <table className="w-full">

            <thead className="bg-blue-900 text-white">

              <tr>
  <th className="p-4 text-left">
    Programme ID
  </th>

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

              {filteredProgrammes.map((programme) => (
                <tr
                  key={programme.id}
                  className="border-b hover:bg-gray-50"
                >
<td className="p-4 font-bold text-blue-700">
  {programme.id}
</td>
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

             {filteredProgrammes.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-gray-500"
                  >
                    No matching programmes found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>
       <style jsx global>{`
      @media print {
        body * {
          visibility: hidden;
        }

        #programme-report,
        #programme-report * {
          visibility: visible;
        }

        #programme-report {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 20px;
          background: white;
        }

        #programme-report table {
          width: 100%;
          border-collapse: collapse;
        }

        #programme-report th,
        #programme-report td {
          border: 1px solid black;
          padding: 8px;
        }

        @page {
          size: landscape;
          margin: 10mm;
        }
      }
    `}</style>

    </DashboardLayout>
  );
}

