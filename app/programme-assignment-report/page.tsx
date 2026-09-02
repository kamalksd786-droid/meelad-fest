"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Registration = {
  id: number | string;
  admission_no?: string | number | null;
  student_name?: string | null;
  class?: string | null;
  division?: string | null;
  chest_no?: string | number | null;
  team?: string | null;
  gender?: string | null;
  category?: string | null;
  programme_id?: number | string | null;
  programme_code?: string | null;
  programme_name?: string | null;
  participant_type?: string | null;
};

type Student = {
  admission_no: string | number;
  student_name?: string | null;
  class?: string | null;
  division?: string | null;
  gender?: string | null;
  team?: string | null;
  category?: string | null;
  chest_no?: string | number | null;
};

type ProgrammeGroup = {
  programmeKey: string;
  programmeId: string;
  programmeCode: string;
  programmeName: string;
  category: string;
  participantType: string;
  registrations: Registration[];
};

const TEAMS = ["DIJLA", "FURATH", "NILE", "SAIHOON"];

function clean(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function isSingleProgramme(type: string | null | undefined): boolean {
  const value = clean(type);

  if (!value) return false;

  const normalized = value.replace(/[^a-z0-9]/g, "");

  return (
    normalized === "individual" ||
    normalized === "single" ||
    normalized === "singleprogramme" ||
    normalized === "individualprogramme" ||
    normalized.includes("individual")
  );
}

function getProgrammeKey(item: Registration): string {
  const id = String(item.programme_id ?? "").trim();

  if (id) {
    return `id-${id}`;
  }

  return `code-${clean(item.programme_code)}-name-${clean(
    item.programme_name
  )}`;
}

export default function ProgrammeAssignmentReportPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [programmeFilter, setProgrammeFilter] = useState("ALL");

  // SINGLE = Individual / Single programmes
  const [typeFilter, setTypeFilter] = useState("SINGLE");

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    setLoading(true);

    const { data: registrationData, error: registrationError } =
      await supabase
        .from("registrations")
        .select(
  `
  id,
  admission_no,
  student_name,
  class,
  chest_no,
  team,
  gender,
  category,
  programme_id,
  programme_code,
  programme_name,
  participant_type
  `
)
        .order("programme_code")
        .order("chest_no");

    if (registrationError) {
      console.error("Registration loading error:", registrationError);
      setLoading(false);
      alert(registrationError.message);
      return;
    }

    const registrationList = (registrationData || []) as Registration[];

    /*
      Get original student information from students table.
      This ensures the report uses the master student data
      for name, class, division, gender, team, category and chest number.
    */

    const admissionNumbers = Array.from(
      new Set(
        registrationList
          .map((item) => String(item.admission_no ?? "").trim())
          .filter(Boolean)
      )
    );

    const studentMap = new Map<string, Student>();

    if (admissionNumbers.length > 0) {
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select(
          `
          admission_no,
          student_name,
          class,
          division,
          gender,
          team,
          category,
          chest_no
        `
        )
        .in("admission_no", admissionNumbers);

      if (studentError) {
        console.error("Student lookup error:", studentError);
      } else {
        for (const student of (studentData || []) as Student[]) {
          studentMap.set(String(student.admission_no).trim(), student);
        }
      }
    }

    const enrichedRegistrations: Registration[] = registrationList.map(
      (registration) => {
        const student = studentMap.get(
          String(registration.admission_no ?? "").trim()
        );

        return {
          ...registration,

          student_name:
            registration.student_name ||
            student?.student_name ||
            "",

          class:
            registration.class ||
            student?.class ||
            "",

          division:
            registration.division ||
            student?.division ||
            "",

          chest_no:
            registration.chest_no ??
            student?.chest_no ??
            null,

          gender:
            registration.gender ||
            student?.gender ||
            "",

          team:
            registration.team ||
            student?.team ||
            "",

          category:
            registration.category ||
            student?.category ||
            "",
        };
      }
    );

    setRegistrations(enrichedRegistrations);
    setLoading(false);
  }

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        registrations
          .map((item) => item.category?.trim())
          .filter(Boolean) as string[]
      )
    ).sort();
  }, [registrations]);

  const programmes = useMemo(() => {
    const map = new Map<string, ProgrammeGroup>();

    for (const item of registrations) {
      const key = getProgrammeKey(item);

      if (!map.has(key)) {
        map.set(key, {
          programmeKey: key,
          programmeId: String(item.programme_id ?? ""),
          programmeCode: item.programme_code || "",
          programmeName: item.programme_name || "",
          category: item.category || "",
          participantType: item.participant_type || "",
          registrations: [],
        });
      }

      map.get(key)!.registrations.push(item);
    }

    return Array.from(map.values()).sort((a, b) =>
      a.programmeCode.localeCompare(b.programmeCode, undefined, {
        numeric: true,
      })
    );
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    const term = search.trim().toLowerCase();

    return registrations.filter((item) => {
      /*
        PROGRAMME TYPE

        The system may store:
        Individual
        Single
        Single Programme
        Individual Programme

        All of these are treated as SINGLE.
      */

      const matchesType =
        typeFilter === "ALL"
          ? true
          : typeFilter === "SINGLE"
            ? isSingleProgramme(item.participant_type)
            : clean(item.participant_type) === clean(typeFilter);

      const matchesProgramme =
        programmeFilter === "ALL"
          ? true
          : getProgrammeKey(item) === programmeFilter;

      const searchText = [
        item.programme_code,
        item.programme_name,
        item.admission_no,
        item.student_name,
        item.chest_no,
        item.team,
        item.gender,
        item.class,
        item.division,
        item.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !term || searchText.includes(term);

      const matchesTeam =
        teamFilter === "ALL" ||
        clean(item.team).toUpperCase() === teamFilter;

      const matchesCategory =
        categoryFilter === "ALL" ||
        clean(item.category) === clean(categoryFilter);

      return (
        matchesType &&
        matchesProgramme &&
        matchesSearch &&
        matchesTeam &&
        matchesCategory
      );
    });
  }, [
    registrations,
    search,
    teamFilter,
    categoryFilter,
    programmeFilter,
    typeFilter,
  ]);

  const programmeGroups = useMemo<ProgrammeGroup[]>(() => {
    const map = new Map<string, ProgrammeGroup>();

    for (const registration of filteredRegistrations) {
      const key = getProgrammeKey(registration);

      if (!map.has(key)) {
        map.set(key, {
          programmeKey: key,
          programmeId: String(registration.programme_id ?? ""),
          programmeCode: registration.programme_code || "",
          programmeName: registration.programme_name || "",
          category: registration.category || "",
          participantType: registration.participant_type || "",
          registrations: [],
        });
      }

      map.get(key)!.registrations.push(registration);
    }

    return Array.from(map.values()).sort((a, b) =>
      a.programmeCode.localeCompare(b.programmeCode, undefined, {
        numeric: true,
      })
    );
  }, [filteredRegistrations]);

  function clearFilters() {
    setSearch("");
    setTeamFilter("ALL");
    setCategoryFilter("ALL");
    setProgrammeFilter("ALL");
    setTypeFilter("SINGLE");
  }

  function printReport() {
    if (programmeGroups.length === 0) {
      alert("No assigned programme list is available to print.");
      return;
    }

    window.print();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-green-950 text-white rounded-2xl p-8 mb-8 shadow-lg no-print">
          <h1 className="text-3xl md:text-4xl font-bold">
            Programme Assigned Lists
          </h1>

          <p className="mt-2 text-green-200">
            Programme-wise assigned student lists for printing and saving as PDF
          </p>
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8 no-print">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

            {/* PROGRAMME */}
            <div>
              <label className="block font-semibold mb-2">
                Programme
              </label>

              <select
                value={programmeFilter}
                onChange={(e) => setProgrammeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-black"
              >
                <option value="ALL">
                  All Programmes
                </option>

                {programmes.map((programme) => (
                  <option
                    key={programme.programmeKey}
                    value={programme.programmeKey}
                  >
                    {programme.programmeCode
                      ? `${programme.programmeCode} - ${programme.programmeName}`
                      : programme.programmeName}
                  </option>
                ))}
              </select>
            </div>

            {/* PROGRAMME TYPE */}
            <div>
              <label className="block font-semibold mb-2">
                Programme Type
              </label>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-black"
              >
                <option value="SINGLE">
                  Single Programmes
                </option>

                <option value="ALL">
                  All Programme Types
                </option>

                <option value="Group">
                  Group
                </option>
              </select>
            </div>

            {/* TEAM */}
            <div>
              <label className="block font-semibold mb-2">
                Team
              </label>

              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-black"
              >
                <option value="ALL">
                  All Teams
                </option>

                {TEAMS.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORY */}
            <div>
              <label className="block font-semibold mb-2">
                Category
              </label>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-black"
              >
                <option value="ALL">
                  All Categories
                </option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* SEARCH */}
            <div>
              <label className="block font-semibold mb-2">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Programme / Name / Chest No..."
                className="w-full border border-gray-300 rounded-lg p-3 text-black"
              />
            </div>

          </div>

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-3 mt-5">

            <button
              type="button"
              onClick={clearFilters}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-5 py-3 rounded-lg"
            >
              Clear Filters
            </button>

            <button
              type="button"
              onClick={loadAssignments}
              className="bg-green-700 hover:bg-green-800 text-white font-bold px-5 py-3 rounded-lg"
            >
              🔄 Refresh
            </button>

            <button
              type="button"
              onClick={printReport}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-3 rounded-lg"
            >
              🖨️ Print / Save PDF
            </button>

          </div>
        </div>

        {/* STATUS */}
        {!loading && (
          <div className="bg-white rounded-xl shadow p-4 mb-6 no-print">
            <p className="font-semibold text-gray-700">
              {programmeGroups.length} programme(s) shown
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Showing{" "}
              {typeFilter === "SINGLE"
                ? "Single"
                : "selected"}{" "}
              programme assignments.
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {filteredRegistrations.length} assigned student record(s)
            </p>
          </div>
        )}

        {/* PRINT HEADER */}
        {!loading && programmeGroups.length > 0 && (
          <div className="print-header">
            <h1>MUNAFASA 2026</h1>
            <h2>
              PROGRAMME-WISE ASSIGNED STUDENT LIST
            </h2>

            <p>
              {typeFilter === "SINGLE"
                ? "SINGLE PROGRAMMES"
                : "PROGRAMME ASSIGNMENT LIST"}
            </p>
          </div>
        )}

        {/* CONTENT */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            Loading programme assignments...
          </div>
        ) : programmeGroups.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-600">
            <p className="text-lg font-semibold">
              No assigned programmes found.
            </p>

            <p className="text-sm mt-2">
              Try selecting{" "}
              <strong>All Programme Types</strong>{" "}
              to check the assignment data.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {programmeGroups.map((programme) => (
              <section
                key={programme.programmeKey}
                className="bg-white rounded-2xl shadow overflow-hidden programme-section"
              >

                {/* PROGRAMME HEADER */}
                <div className="bg-green-900 text-white p-5">

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    <div>
                      <div className="text-sm text-green-200">
                        Programme ID
                      </div>

                      <div className="text-xl font-bold">
                        {programme.programmeCode ||
                          programme.programmeId ||
                          "—"}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <div className="text-sm text-green-200">
                        Programme Name
                      </div>

                      <div className="text-xl font-bold">
                        {programme.programmeName ||
                          "Programme"}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-green-200">
                        Participants
                      </div>

                      <div className="text-xl font-bold">
                        {programme.registrations.length}
                      </div>
                    </div>

                  </div>

                  <div className="text-green-100 mt-3">
                    <strong>Category:</strong>{" "}
                    {programme.category || "—"}

                    <span className="mx-2">
                      •
                    </span>

                    <strong>
                      Programme Type:
                    </strong>{" "}
                    {programme.participantType || "—"}
                  </div>

                </div>

                {/* STUDENT LIST */}
                <div className="overflow-x-auto">

                  <table className="w-full border-collapse assigned-table">

                    <thead>
                      <tr className="bg-gray-100">

                        <th className="border p-3 text-center">
                          Sl. No.
                        </th>

                        <th className="border p-3 text-left">
                          Admission No.
                        </th>

                        <th className="border p-3 text-left">
                          Student Name
                        </th>

                        <th className="border p-3 text-left">
                          Chest No.
                        </th>

                        <th className="border p-3 text-left">
                          Gender
                        </th>

                        <th className="border p-3 text-left">
                          Class
                        </th>

                        <th className="border p-3 text-left">
                          Division
                        </th>

                        <th className="border p-3 text-left">
                          Team
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {programme.registrations.map(
                        (registration, index) => (
                          <tr
                            key={registration.id}
                            className="hover:bg-gray-50"
                          >

                            <td className="border p-3 text-center">
                              {index + 1}
                            </td>

                            <td className="border p-3 font-semibold">
                              {registration.admission_no ?? "—"}
                            </td>

                            <td className="border p-3 font-semibold">
                              {registration.student_name || "—"}
                            </td>

                            <td className="border p-3 font-bold">
                              {registration.chest_no ?? "—"}
                            </td>

                            <td className="border p-3">
                              {registration.gender || "—"}
                            </td>

                            <td className="border p-3">
                              {registration.class || "—"}
                            </td>

                            <td className="border p-3">
                              {registration.division || "—"}
                            </td>

                            <td className="border p-3 font-semibold">
                              {registration.team
                                ? registration.team.toUpperCase()
                                : "—"}
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </section>
            ))}

          </div>
        )}

      </div>

      {/* PRINT CSS */}
      <style jsx global>{`

        .print-header {
          display: none;
        }

        @media print {

          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          main {
            padding: 0 !important;
            background: white !important;
          }

          main > div {
            max-width: none !important;
          }

          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 10mm;
            color: black;
          }

          .print-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
          }

          .print-header h2 {
            margin: 5px 0;
            font-size: 17px;
            font-weight: 700;
          }

          .print-header p {
            margin: 0;
            font-size: 12px;
            font-weight: 600;
          }

          .programme-section {
            box-shadow: none !important;
            border: 1px solid #222 !important;
            border-radius: 0 !important;
            margin-bottom: 10mm !important;
            break-inside: avoid;
          }

          .programme-section > div:first-child {
            background: white !important;
            color: black !important;
            border-bottom: 1px solid #222 !important;
          }

          .programme-section > div:first-child * {
            color: black !important;
          }

          .assigned-table {
            font-size: 9.5px !important;
          }

          .assigned-table th,
          .assigned-table td {
            border-color: #222 !important;
            padding: 5px !important;
          }

          .assigned-table thead {
            display: table-header-group;
          }

          tr {
            break-inside: avoid;
          }

        }

      `}</style>
    </main>
  );
}