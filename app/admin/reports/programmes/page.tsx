"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Programme = {
  id: number;
  programme_code: string | null;
  programme_name: string | null;
  category: string | null;
  event_type: string | null;
  participant_type: string | null;
  programme_type: string | null;
  max_participants: string | number | null;
  gender: string | null;
};

type Registration = {
  id: number;
  programme_id: number | null;
  admission_no: string | null;
  student_name: string | null;
  category: string | null;
  team: string | null;
  programme_code: string | null;
  programme_name: string | null;
};

type Student = {
  admission_no: string | null;
  gender: string | null;
};

type PublishedResult = {
  programme_id: number | null;
  programme_name: string | null;
  registration_id: number | null;
  student_id: number | null;
  admission_no: string | null;
  student_name: string | null;
  team: string | null;
  category: string | null;
  position: number | null;
};

type ReportRow = {
  programmeId: number | string;
  programmeCode: string;
  programmeName: string;
  category: string;
  eventType: string;
  boys: number;
  girls: number;
  total: number;
  first: number;
  second: number;
  third: number;
};

async function fetchAllRows<T>(
  table: string,
  select: string = "*"
): Promise<T[]> {
  const allRows: T[] = [];
  const pageSize = 1000;

  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(`${table}: ${error.message}`);
    }

    const rows = (data || []) as T[];

    allRows.push(...rows);

    if (rows.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return allRows;
}

export default function ProgrammeRegistrationReport() {
  const [report, setReport] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadReport() {
    try {
      setLoading(true);
      setErrorMessage("");

      /*
       * Load all required data
       */

      const [
        programmes,
        registrations,
        students,
        publishedResults,
      ] = await Promise.all([
        fetchAllRows<Programme>("programmes"),

        fetchAllRows<Registration>("registrations"),

        fetchAllRows<Student>(
          "students",
          "admission_no,gender"
        ),

        fetchAllRows<PublishedResult>(
          "published_results",
          `
            programme_id,
            programme_name,
            registration_id,
            student_id,
            admission_no,
            student_name,
            team,
            category,
            position
          `
        ),
      ]);

      /*
       * -----------------------------------------
       * STUDENT GENDER MAP
       * -----------------------------------------
       */

      const genderMap = new Map<string, string>();

      students.forEach((student) => {
        if (!student.admission_no) return;

        genderMap.set(
          String(student.admission_no).trim(),
          String(student.gender || "")
            .trim()
            .toLowerCase()
        );
      });

      /*
       * -----------------------------------------
       * PROGRAMME MAP
       * -----------------------------------------
       */

      const programmeMap = new Map<number, Programme>();

      programmes.forEach((programme) => {
        programmeMap.set(
          Number(programme.id),
          programme
        );
      });

      /*
       * -----------------------------------------
       * REGISTRATION COUNTS
       * -----------------------------------------
       */

      const counts = new Map<string, ReportRow>();

      registrations.forEach((registration) => {
        const programmeId =
          registration.programme_id;

        const programme =
          programmeId !== null
            ? programmeMap.get(Number(programmeId))
            : undefined;

        const programmeCode =
          programme?.programme_code ||
          registration.programme_code ||
          "";

        const programmeName =
          programme?.programme_name ||
          registration.programme_name ||
          "Unknown Programme";

        const category =
          programme?.category ||
          registration.category ||
          "Unknown";

        const eventType =
          programme?.event_type ||
          "Unknown";

        const key =
          programmeId !== null
            ? `id-${programmeId}`
            : `${programmeCode}-${programmeName}`;

        if (!counts.has(key)) {
          counts.set(key, {
            programmeId:
              programmeId !== null
                ? programmeId
                : "—",

            programmeCode,

            programmeName,

            category,

            eventType,

            boys: 0,
            girls: 0,
            total: 0,

            first: 0,
            second: 0,
            third: 0,
          });
        }

        const row = counts.get(key)!;

        /*
         * Find gender from students table
         */

        const admissionNo = String(
          registration.admission_no || ""
        ).trim();

        const gender =
          genderMap.get(admissionNo);

        if (
          gender === "boy" ||
          gender === "boys" ||
          gender === "male"
        ) {
          row.boys++;
        }

        if (
          gender === "girl" ||
          gender === "girls" ||
          gender === "female"
        ) {
          row.girls++;
        }

        row.total++;
      });

      /*
       * -----------------------------------------
       * POSITION COUNTS
       * -----------------------------------------
       *
       * IMPORTANT:
       *
       * published_results already has
       * programme_id.
       *
       * Therefore we use programme_id directly.
       *
       * Individual:
       *   1st = 1
       *   2nd = 1
       *   3rd = 1
       *
       * Group:
       *   use max_participants.
       *
       * Example:
       *
       * max_participants = 5
       *
       * 1st = 5
       * 2nd = 5
       * 3rd = 5
       */

      const countedResults = new Set<string>();

      publishedResults.forEach((result) => {
        /*
         * No programme ID = cannot safely connect
         * the result to a programme.
         */

        if (result.programme_id === null) {
          return;
        }

        const programmeId =
          Number(result.programme_id);

        const programme =
          programmeMap.get(programmeId);

        if (!programme) {
          return;
        }

        const reportKey =
          `id-${programmeId}`;

        /*
         * Create report row if this programme
         * doesn't already have registrations.
         */

        if (!counts.has(reportKey)) {
          counts.set(reportKey, {
            programmeId,

            programmeCode:
              programme.programme_code || "",

            programmeName:
              programme.programme_name ||
              result.programme_name ||
              "",

            category:
              programme.category ||
              result.category ||
              "Unknown",

            eventType:
              programme.event_type ||
              "Unknown",

            boys: 0,
            girls: 0,
            total: 0,

            first: 0,
            second: 0,
            third: 0,
          });
        }

        const row =
          counts.get(reportKey)!;

        const position =
          Number(result.position || 0);

        /*
         * Only 1st, 2nd and 3rd
         */

        if (
          position !== 1 &&
          position !== 2 &&
          position !== 3
        ) {
          return;
        }

        /*
         * -----------------------------------------
         * DETERMINE GROUP / INDIVIDUAL
         * -----------------------------------------
         */

        const maxParticipants =
          Number(
            programme.max_participants || 0
          );

        const participantType =
          String(
            programme.participant_type ||
              programme.programme_type ||
              ""
          )
            .trim()
            .toLowerCase();

        const isGroup =
          maxParticipants > 1 ||
          participantType.includes("group");

        /*
         * -----------------------------------------
         * UNIQUE RESULT ENTRY
         * -----------------------------------------
         *
         * For group:
         *
         * programme + team + position
         *
         * For individual:
         *
         * programme + student + position
         *
         * This prevents 5 students in the same
         * winning group from being counted 5 times.
         */

        const entryIdentifier = isGroup
          ? String(result.team || "")
              .trim()
              .toLowerCase()
          : String(
              result.admission_no ||
                result.student_name ||
                result.student_id ||
                ""
            )
              .trim()
              .toLowerCase();

        const uniqueResultKey =
          `${programmeId}|${position}|${entryIdentifier}`;

        if (
          countedResults.has(uniqueResultKey)
        ) {
          return;
        }

        countedResults.add(
          uniqueResultKey
        );

        /*
         * -----------------------------------------
         * CALCULATE POSITION STUDENT COUNT
         * -----------------------------------------
         */

        let participantCount = 1;

        if (
          isGroup &&
          maxParticipants > 0
        ) {
          participantCount =
            maxParticipants;
        }

        /*
         * Add the students receiving the
         * position.
         */

        if (position === 1) {
          row.first += participantCount;
        }

        if (position === 2) {
          row.second += participantCount;
        }

        if (position === 3) {
          row.third += participantCount;
        }
      });

      /*
       * -----------------------------------------
       * SORT
       * -----------------------------------------
       */

      const rows = Array.from(
        counts.values()
      ).sort((a, b) => {
        const categoryCompare =
          a.category.localeCompare(
            b.category
          );

        if (categoryCompare !== 0) {
          return categoryCompare;
        }

        return a.programmeName.localeCompare(
          b.programmeName
        );
      });

      setReport(rows);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load report."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * -----------------------------------------
   * LOAD
   * -----------------------------------------
   */

  useEffect(() => {
    loadReport();
  }, []);

  /*
   * -----------------------------------------
   * GRAND TOTALS
   * -----------------------------------------
   */

  const totals = useMemo(() => {
    return report.reduce(
      (acc, row) => {
        acc.boys += row.boys;
        acc.girls += row.girls;
        acc.total += row.total;

        acc.first += row.first;
        acc.second += row.second;
        acc.third += row.third;

        return acc;
      },
      {
        boys: 0,
        girls: 0,
        total: 0,

        first: 0,
        second: 0,
        third: 0,
      }
    );
  }, [report]);

  /*
   * -----------------------------------------
   * CATEGORY TOTALS
   * -----------------------------------------
   */

  const categoryTotals = useMemo(() => {
    const map = new Map<
      string,
      {
        programmes: number;
        boys: number;
        girls: number;
        total: number;
        first: number;
        second: number;
        third: number;
      }
    >();

    report.forEach((row) => {
      const category =
        row.category || "Unknown";

      if (!map.has(category)) {
        map.set(category, {
          programmes: 0,
          boys: 0,
          girls: 0,
          total: 0,
          first: 0,
          second: 0,
          third: 0,
        });
      }

      const item =
        map.get(category)!;

      item.programmes++;

      item.boys += row.boys;
      item.girls += row.girls;
      item.total += row.total;

      item.first += row.first;
      item.second += row.second;
      item.third += row.third;
    });

    return Array.from(
      map.entries()
    ).map(([category, values]) => ({
      category,
      ...values,
    }));
  }, [report]);

  /*
   * -----------------------------------------
   * PRINT
   * -----------------------------------------
   */

  function printReport() {
    window.print();
  }

  /*
   * -----------------------------------------
   * PDF
   * -----------------------------------------
   */

  function downloadPDF() {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);

    doc.text(
      "MUNAFASA 2026",
      148,
      15,
      {
        align: "center",
      }
    );

    doc.setFontSize(13);

    doc.text(
      "Programme Registration & Position Report",
      148,
      23,
      {
        align: "center",
      }
    );

    doc.setFontSize(8);

    doc.text(
      `Programmes: ${report.length}   Boys: ${totals.boys}   Girls: ${totals.girls}   Registrations: ${totals.total}`,
      148,
      30,
      {
        align: "center",
      }
    );

    const tableData =
      report.map((row) => [
        String(row.programmeId),
        row.programmeCode,
        row.programmeName,
        row.category,
        row.eventType,
        String(row.boys),
        String(row.girls),
        String(row.total),
        String(row.first),
        String(row.second),
        String(row.third),
      ]);

    autoTable(doc, {
      startY: 36,

      head: [
        [
          "ID",
          "Code",
          "Programme",
          "Category",
          "Event",
          "Boys",
          "Girls",
          "Total",
          "1st",
          "2nd",
          "3rd",
        ],
      ],

      body: tableData,

      styles: {
        fontSize: 6.5,
        cellPadding: 1.5,
      },

      headStyles: {
        fontSize: 6.5,
        fontStyle: "bold",
      },

      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 20 },
        2: { cellWidth: 48 },
        3: { cellWidth: 22 },
        4: { cellWidth: 22 },
        5: { cellWidth: 12 },
        6: { cellWidth: 12 },
        7: { cellWidth: 12 },
        8: { cellWidth: 12 },
        9: { cellWidth: 12 },
        10: { cellWidth: 12 },
      },
    });

    const finalY =
      (doc as any).lastAutoTable?.finalY ||
      36;

    doc.setFontSize(9);

    doc.text(
      `Grand Total   Boys: ${totals.boys}   Girls: ${totals.girls}   Students: ${totals.total}   1st: ${totals.first}   2nd: ${totals.second}   3rd: ${totals.third}`,
      148,
      finalY + 9,
      {
        align: "center",
      }
    );

    doc.save(
      "MUNAFASA-2026-Programme-Registration-Report.pdf"
    );
  }

  /*
   * -----------------------------------------
   * LOADING
   * -----------------------------------------
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-green-950 text-white flex items-center justify-center">
        <div className="text-2xl font-bold">
          Loading Programme Report...
        </div>
      </div>
    );
  }

  /*
   * -----------------------------------------
   * ERROR
   * -----------------------------------------
   */

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-green-950 text-white p-8">

        <div className="max-w-4xl mx-auto bg-red-700 rounded-xl p-8">

          <h1 className="text-3xl font-bold mb-4">
            Report Error
          </h1>

          <p>{errorMessage}</p>

          <button
            onClick={loadReport}
            className="mt-6 bg-white text-red-700 px-5 py-3 rounded-lg font-bold"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  /*
   * -----------------------------------------
   * MAIN PAGE
   * -----------------------------------------
   */

  return (
    <>
      <div className="min-h-screen bg-green-950 text-white p-6 md:p-8 print:bg-white print:text-black">

        <div className="max-w-7xl mx-auto">

          {/* HEADER */}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 print:mb-4">

            <div>

              <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 print:text-black">
                📊 MUNAFASA 2026
              </h1>

              <h2 className="text-2xl md:text-3xl font-bold mt-2">
                Programme Registration & Position Report
              </h2>

              <p className="text-gray-300 mt-2 print:text-gray-700">
                Live registration and result statistics
              </p>

            </div>

            <div className="flex gap-3 print:hidden">

              <button
                onClick={loadReport}
                className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg font-bold"
              >
                🔄 Refresh
              </button>

              <button
                onClick={printReport}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-3 rounded-lg font-bold"
              >
                🖨 Print
              </button>

              <button
                onClick={downloadPDF}
                className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-lg font-bold"
              >
                📄 PDF
              </button>

            </div>

          </div>

          {/* SUMMARY */}

          <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8">

            <div className="bg-purple-700 rounded-xl p-4">
              <p className="text-xs">
                PROGRAMMES
              </p>

              <p className="text-3xl font-bold mt-2">
                {report.length}
              </p>
            </div>

            <div className="bg-blue-700 rounded-xl p-4">
              <p className="text-xs">
                BOYS
              </p>

              <p className="text-3xl font-bold mt-2">
                {totals.boys}
              </p>
            </div>

            <div className="bg-pink-700 rounded-xl p-4">
              <p className="text-xs">
                GIRLS
              </p>

              <p className="text-3xl font-bold mt-2">
                {totals.girls}
              </p>
            </div>

            <div className="bg-green-700 rounded-xl p-4">
              <p className="text-xs">
                REGISTERED
              </p>

              <p className="text-3xl font-bold mt-2">
                {totals.total}
              </p>
            </div>

            <div className="bg-yellow-600 text-black rounded-xl p-4">
              <p className="text-xs">
                🥇 1ST
              </p>

              <p className="text-3xl font-bold mt-2">
                {totals.first}
              </p>
            </div>

            <div className="bg-gray-400 text-black rounded-xl p-4">
              <p className="text-xs">
                🥈 2ND
              </p>

              <p className="text-3xl font-bold mt-2">
                {totals.second}
              </p>
            </div>

            <div className="bg-orange-600 rounded-xl p-4">
              <p className="text-xs">
                🥉 3RD
              </p>

              <p className="text-3xl font-bold mt-2">
                {totals.third}
              </p>
            </div>

          </div>

          {/* MAIN REPORT */}

          <div className="bg-white text-black rounded-xl shadow-xl overflow-hidden">

            <div className="p-5 border-b">

              <h2 className="text-2xl font-bold">
                Programme-wise Registration & Position Count
              </h2>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-green-800 text-white">

                  <tr>

                    <th className="p-3 text-left">
                      ID
                    </th>

                    <th className="p-3 text-left">
                      Code
                    </th>

                    <th className="p-3 text-left">
                      Programme
                    </th>

                    <th className="p-3 text-left">
                      Category
                    </th>

                    <th className="p-3 text-left">
                      Event
                    </th>

                    <th className="p-3 text-center">
                      Boys
                    </th>

                    <th className="p-3 text-center">
                      Girls
                    </th>

                    <th className="p-3 text-center">
                      Total
                    </th>

                    <th className="p-3 text-center">
                      🥇 1st
                    </th>

                    <th className="p-3 text-center">
                      🥈 2nd
                    </th>

                    <th className="p-3 text-center">
                      🥉 3rd
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {report.map(
                    (row, index) => (

                      <tr
                        key={`${row.programmeId}-${index}`}
                        className="border-b hover:bg-gray-50"
                      >

                        <td className="p-3 font-bold">
                          {row.programmeId}
                        </td>

                        <td className="p-3 font-semibold">
                          {row.programmeCode || "—"}
                        </td>

                        <td className="p-3 font-semibold">
                          {row.programmeName}
                        </td>

                        <td className="p-3">
                          {row.category}
                        </td>

                        <td className="p-3">
                          {row.eventType}
                        </td>

                        <td className="p-3 text-center font-bold text-blue-700">
                          {row.boys}
                        </td>

                        <td className="p-3 text-center font-bold text-pink-700">
                          {row.girls}
                        </td>

                        <td className="p-3 text-center font-bold">
                          {row.total}
                        </td>

                        <td className="p-3 text-center font-bold text-yellow-600">
                          {row.first}
                        </td>

                        <td className="p-3 text-center font-bold text-gray-600">
                          {row.second}
                        </td>

                        <td className="p-3 text-center font-bold text-orange-600">
                          {row.third}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

                <tfoot className="bg-gray-200 font-bold">

                  <tr>

                    <td
                      colSpan={5}
                      className="p-4 text-right"
                    >
                      GRAND TOTAL
                    </td>

                    <td className="p-4 text-center text-blue-700">
                      {totals.boys}
                    </td>

                    <td className="p-4 text-center text-pink-700">
                      {totals.girls}
                    </td>

                    <td className="p-4 text-center">
                      {totals.total}
                    </td>

                    <td className="p-4 text-center text-yellow-600">
                      {totals.first}
                    </td>

                    <td className="p-4 text-center text-gray-600">
                      {totals.second}
                    </td>

                    <td className="p-4 text-center text-orange-600">
                      {totals.third}
                    </td>

                  </tr>

                </tfoot>

              </table>

            </div>

          </div>

          {/* CATEGORY SUMMARY */}

          <div className="mt-8 bg-white text-black rounded-xl shadow-xl overflow-hidden">

            <div className="p-5 border-b">

              <h2 className="text-2xl font-bold">
                📊 Category-wise Summary
              </h2>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-green-800 text-white">

                  <tr>

                    <th className="p-3 text-left">
                      Category
                    </th>

                    <th className="p-3 text-center">
                      Programmes
                    </th>

                    <th className="p-3 text-center">
                      Boys
                    </th>

                    <th className="p-3 text-center">
                      Girls
                    </th>

                    <th className="p-3 text-center">
                      Total
                    </th>

                    <th className="p-3 text-center">
                      🥇 1st
                    </th>

                    <th className="p-3 text-center">
                      🥈 2nd
                    </th>

                    <th className="p-3 text-center">
                      🥉 3rd
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {categoryTotals.map(
                    (item) => (

                      <tr
                        key={item.category}
                        className="border-b"
                      >

                        <td className="p-3 font-bold">
                          {item.category}
                        </td>

                        <td className="p-3 text-center">
                          {item.programmes}
                        </td>

                        <td className="p-3 text-center">
                          {item.boys}
                        </td>

                        <td className="p-3 text-center">
                          {item.girls}
                        </td>

                        <td className="p-3 text-center font-bold">
                          {item.total}
                        </td>

                        <td className="p-3 text-center font-bold text-yellow-600">
                          {item.first}
                        </td>

                        <td className="p-3 text-center font-bold text-gray-600">
                          {item.second}
                        </td>

                        <td className="p-3 text-center font-bold text-orange-600">
                          {item.third}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

          <div className="text-center mt-8 text-gray-300 print:text-gray-600">
            MUNAFASA 2026 • Programme Registration & Position Report
          </div>

        </div>

      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          body {
            background: white !important;
          }

          button {
            display: none !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          thead {
            display: table-header-group;
          }
        }
      `}</style>
    </>
  );
}