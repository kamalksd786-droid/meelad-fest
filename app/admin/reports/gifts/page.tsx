"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/app/lib/supabase";

type GiftRow = {
  id: number;
  programme_code: string;
  programme_name: string;
  category: string;
  participants: number;
  first: number;
  second: number;
  third: number;
  total: number;
};

/*
  FIXED GIFT ALLOCATION
  These numbers are for PURCHASE PLANNING.
  They do NOT depend on published_results.
*/
const GIFT_ALLOCATION: Record<number, number> = {
  49: 3,
  58: 3,
  85: 2,
  102: 3,
  103: 5,
  104: 7,
  106: 13,
  107: 10,
  108: 10,
  109: 7,
  110: 5,
  111: 5,
  113: 7,
};

export default function GiftPurchaseReport() {
  const [rows, setRows] = useState<GiftRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGiftProgrammes();
  }, []);

  async function loadGiftProgrammes() {
  setLoading(true);

  const { data, error } = await supabase
    .from("programmes")
    .select(
      "id, programme_code, programme_name, category, programme_type, is_active"
    )
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    alert("Failed to load programmes.");
    setLoading(false);
    return;
  }

  const finalRows: GiftRow[] = (data || [])
    .map((programme: any) => {
      const id = Number(programme.id);

      /*
        1. Fixed gift programmes:
           Use our exact purchase allocation.
      */
      if (GIFT_ALLOCATION[id] !== undefined) {
        const participants = GIFT_ALLOCATION[id];

        return {
          id,
          programme_code: String(programme.programme_code || ""),
          programme_name: String(programme.programme_name || ""),
          category: String(programme.category || "General"),
          participants,
          first: participants,
          second: participants,
          third: participants,
          total: participants * 3,
        };
      }

      /*
        2. All other Individual programmes:
           One participant gets 1 gift for each position.
      */
      if (
        String(programme.programme_type || "").toLowerCase() ===
        "individual"
      ) {
        const participants = 1;

        return {
          id,
          programme_code: String(programme.programme_code || ""),
          programme_name: String(programme.programme_name || ""),
          category: String(programme.category || "General"),
          participants,
          first: 1,
          second: 1,
          third: 1,
          total: 3,
        };
      }

      /*
        3. Other group programmes are not included,
           because their gift allocation has not been fixed.
      */
      return null;
    })
    .filter((row): row is GiftRow => row !== null);

  setRows(finalRows);
  setLoading(false);
}

  const totalParticipants = rows.reduce(
    (sum, row) => sum + row.participants,
    0
  );

  const totalFirst = rows.reduce(
    (sum, row) => sum + row.first,
    0
  );

  const totalSecond = rows.reduce(
    (sum, row) => sum + row.second,
    0
  );

  const totalThird = rows.reduce(
    (sum, row) => sum + row.third,
    0
  );

  const grandTotal = rows.reduce(
    (sum, row) => sum + row.total,
    0
  );

  function printReport() {
    window.print();
  }

  function downloadPDF() {
    const doc = new jsPDF("landscape");

    doc.setFontSize(18);
    doc.text("MUNAFASA 2026", 148, 15, {
      align: "center",
    });

    doc.setFontSize(13);
    doc.text("Gift Purchase Report", 148, 23, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.text(
      `Total Participants: ${totalParticipants}    |    Total Gifts: ${grandTotal}`,
      148,
      31,
      { align: "center" }
    );

    autoTable(doc, {
      startY: 38,
      head: [
        [
          "Sl No",
          "Programme ID",
          "Programme Code",
          "Programme",
          "Category",
          "Participants",
          "1st",
          "2nd",
          "3rd",
          "Total Gifts",
        ],
      ],
      body: rows.map((row, index) => [
        index + 1,
        row.id,
        row.programme_code,
        row.programme_name,
        row.category,
        row.participants,
        row.first,
        row.second,
        row.third,
        row.total,
      ]),
      foot: [
        [
          "",
          "",
          "",
          "GRAND TOTAL",
          "",
          totalParticipants,
          totalFirst,
          totalSecond,
          totalThird,
          grandTotal,
        ],
      ],
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        halign: "center",
      },
      footStyles: {
        fontStyle: "bold",
      },
    });

    doc.save("MUNAFASA-2026-Gift-Purchase-Report.pdf");
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">
          Gift Purchase Report
        </h1>

        <p className="mt-4 text-gray-600">
          Loading programmes...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* PRINT STYLES */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .print-area {
            width: 100%;
            padding: 0 !important;
          }

          table {
            font-size: 11px !important;
          }

          @page {
            size: landscape;
            margin: 10mm;
          }
        }
      `}</style>

      <div className="print-area mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                MUNAFASA 2026
              </h1>

              <h2 className="mt-1 text-lg font-semibold text-gray-700">
                Gift Purchase Report
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Fixed allocation for gift purchasing
              </p>
            </div>

            <div className="no-print flex gap-2">
              <button
                onClick={printReport}
                className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
              >
                🖨 Print
              </button>

              <button
                onClick={downloadPDF}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                📄 PDF
              </button>
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow">
            <p className="text-sm text-gray-500">
              Programmes
            </p>

            <p className="mt-1 text-2xl font-bold">
              {rows.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <p className="text-sm text-gray-500">
              Participants
            </p>

            <p className="mt-1 text-2xl font-bold">
              {totalParticipants}
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <p className="text-sm text-gray-500">
              1st + 2nd + 3rd
            </p>

            <p className="mt-1 text-2xl font-bold">
              {grandTotal}
            </p>
          </div>

          <div className="rounded-xl bg-green-50 p-4 shadow">
            <p className="text-sm font-medium text-green-700">
              Total Gifts to Purchase
            </p>

            <p className="mt-1 text-3xl font-bold text-green-700">
              {grandTotal}
            </p>
          </div>
        </div>

        {/* REPORT TABLE */}
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border px-3 py-3 text-center">
                    Sl
                  </th>

                  <th className="border px-3 py-3 text-center">
                    ID
                  </th>

                  <th className="border px-3 py-3 text-left">
                    Programme Code
                  </th>

                  <th className="border px-3 py-3 text-left">
                    Programme
                  </th>

                  <th className="border px-3 py-3 text-left">
                    Category
                  </th>

                  <th className="border px-3 py-3 text-center">
                    Participants
                  </th>

                  <th className="border px-3 py-3 text-center">
                    1st
                  </th>

                  <th className="border px-3 py-3 text-center">
                    2nd
                  </th>

                  <th className="border px-3 py-3 text-center">
                    3rd
                  </th>

                  <th className="border px-3 py-3 text-center">
                    Total Gifts
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="border px-3 py-3 text-center">
                      {index + 1}
                    </td>

                    <td className="border px-3 py-3 text-center font-medium">
                      {row.id}
                    </td>

                    <td className="border px-3 py-3">
                      {row.programme_code}
                    </td>

                    <td className="border px-3 py-3 font-medium">
                      {row.programme_name}
                    </td>

                    <td className="border px-3 py-3">
                      {row.category}
                    </td>

                    <td className="border px-3 py-3 text-center font-semibold">
                      {row.participants}
                    </td>

                    <td className="border px-3 py-3 text-center">
                      {row.first}
                    </td>

                    <td className="border px-3 py-3 text-center">
                      {row.second}
                    </td>

                    <td className="border px-3 py-3 text-center">
                      {row.third}
                    </td>

                    <td className="border px-3 py-3 text-center font-bold">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td
                    colSpan={5}
                    className="border px-3 py-4 text-right"
                  >
                    GRAND TOTAL
                  </td>

                  <td className="border px-3 py-4 text-center">
                    {totalParticipants}
                  </td>

                  <td className="border px-3 py-4 text-center">
                    {totalFirst}
                  </td>

                  <td className="border px-3 py-4 text-center">
                    {totalSecond}
                  </td>

                  <td className="border px-3 py-4 text-center">
                    {totalThird}
                  </td>

                  <td className="border px-3 py-4 text-center text-lg">
                    {grandTotal}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* PURCHASE SUMMARY */}
        <div className="mt-6 rounded-xl bg-white p-5 shadow">
          <h3 className="mb-4 text-lg font-bold">
            Purchase Summary
          </h3>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                1st Place Gifts
              </p>
              <p className="text-2xl font-bold">
                {totalFirst}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                2nd Place Gifts
              </p>
              <p className="text-2xl font-bold">
                {totalSecond}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                3rd Place Gifts
              </p>
              <p className="text-2xl font-bold">
                {totalThird}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-green-100 p-5 text-center">
            <p className="text-sm font-medium text-green-800">
              FINAL GIFT PURCHASE QUANTITY
            </p>

            <p className="mt-1 text-4xl font-bold text-green-800">
              {grandTotal}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}