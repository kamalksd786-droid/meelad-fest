"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";

type ExcelRow = Record<string, any>;

type TimetableItem = {
  category: string;
  time: string;
  programme: string;
  venue: string;
};

export default function AutomaticSchedulingPage() {
  const [fileName, setFileName] = useState("");
  const [excelRows, setExcelRows] = useState<ExcelRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState("");

  const [programmeColumn, setProgrammeColumn] = useState("");
  const [programmeIdColumn, setProgrammeIdColumn] = useState("");
  const [categoryColumn, setCategoryColumn] = useState("");
  const [studentNameColumn, setStudentNameColumn] = useState("");
  const [chestNoColumn, setChestNoColumn] = useState("");
  const [teamColumn, setTeamColumn] = useState("");

  const [scheduleItems, setScheduleItems] = useState<TimetableItem[]>([
    {
      category: "Junior",
      time: "10:30 - 11:30",
      programme: "Quiz",
      venue: "AV Hall",
    },
    {
      category: "Senior",
      time: "10:00 - 11:00",
      programme: "Cartoon",
      venue: "VIII A",
    },
    {
      category: "Senior",
      time: "10:00 - 11:00",
      programme: "Story Writing Hindi",
      venue: "VIII B",
    },
    {
      category: "Senior",
      time: "11:00 - 12:30",
      programme: "Collage",
      venue: "VIII A & VIII B",
    },
    {
      category: "Senior",
      time: "11:00 - 12:00",
      programme: "Essay Writing Hindi",
      venue: "VII A",
    },
    {
      category: "Senior",
      time: "01:30 - 02:30",
      programme: "Story Writing Malayalam",
      venue: "VIII A & VIII B",
    },
    {
      category: "Senior",
      time: "02:30 - 03:30",
      programme: "Versification English",
      venue: "VII A",
    },
  ]);

  const [generatedSchedule, setGeneratedSchedule] = useState<
    ExcelRow[]
  >([]);

  const [error, setError] = useState("");

  async function handleExcelUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setGeneratedSchedule([]);

    try {
      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
      });

      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error("No worksheet found in the Excel file.");
      }

      const worksheet = workbook.Sheets[firstSheetName];

      const rows = XLSX.utils.sheet_to_json<ExcelRow>(
        worksheet,
        {
          defval: "",
        }
      );

      if (!rows.length) {
        throw new Error(
          "The selected Excel sheet does not contain any data."
        );
      }

      const detectedHeaders = Object.keys(rows[0]);

      setFileName(file.name);
      setSelectedSheet(firstSheetName);
      setExcelRows(rows);
      setHeaders(detectedHeaders);

      // Try to automatically detect common column names.
      autoDetectColumns(detectedHeaders);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to read the Excel file."
      );

      setExcelRows([]);
      setHeaders([]);
    }
  }

  function autoDetectColumns(columns: string[]) {
    const findColumn = (
      possibleNames: string[]
    ) => {
      return (
        columns.find((column) =>
          possibleNames.some(
            (name) =>
              column
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]/g, "")
                .includes(name)
          )
        ) || ""
      );
    };

    setProgrammeColumn(
      findColumn([
        "programmename",
        "programme",
        "eventname",
        "event",
      ])
    );

    setProgrammeIdColumn(
      findColumn([
        "programmeid",
        "programmeid",
        "eventid",
        "id",
      ])
    );

    setCategoryColumn(
      findColumn([
        "category",
      ])
    );

    setStudentNameColumn(
      findColumn([
        "studentname",
        "name",
      ])
    );

    setChestNoColumn(
      findColumn([
        "chestno",
        "chestnumber",
        "chest",
      ])
    );

    setTeamColumn(
      findColumn([
        "team",
        "teamname",
      ])
    );
  }

  function updateScheduleItem(
    index: number,
    field: keyof TimetableItem,
    value: string
  ) {
    setScheduleItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addScheduleItem() {
    setScheduleItems((current) => [
      ...current,
      {
        category: "",
        time: "",
        programme: "",
        venue: "",
      },
    ]);
  }

  function removeScheduleItem(index: number) {
    setScheduleItems((current) =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  function normalise(value: any) {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[‐-‒–—]/g, "-");
  }

  function generateSchedule() {
    setError("");

    if (!excelRows.length) {
      setError(
        "Please upload the Off Stage Excel file first."
      );
      return;
    }

    if (!programmeColumn) {
      setError(
        "Please select the Programme Name column."
      );
      return;
    }

    if (!categoryColumn) {
      setError(
        "Please select the Category column."
      );
      return;
    }

    const finalSchedule: ExcelRow[] = [];

    for (const item of scheduleItems) {
      if (
        !item.programme.trim() ||
        !item.time.trim() ||
        !item.venue.trim()
      ) {
        continue;
      }

      const matchingRows = excelRows.filter((row) => {
        const excelProgramme = normalise(
          row[programmeColumn]
        );

        const timetableProgramme = normalise(
          item.programme
        );

        const excelCategory = normalise(
          row[categoryColumn]
        );

        const timetableCategory = normalise(
          item.category
        );

        return (
          excelProgramme === timetableProgramme &&
          (!timetableCategory ||
            excelCategory === timetableCategory)
        );
      });

      for (const row of matchingRows) {
        finalSchedule.push({
          "Programme ID": programmeIdColumn
            ? row[programmeIdColumn]
            : "",

          "Programme Name": row[programmeColumn],

          Category: categoryColumn
            ? row[categoryColumn]
            : item.category,

          "Time": item.time,

          "Venue": item.venue,

          "Chest No": chestNoColumn
            ? row[chestNoColumn]
            : "",

          "Student Name": studentNameColumn
            ? row[studentNameColumn]
            : "",

          Team: teamColumn
            ? row[teamColumn]
            : "",
        });
      }
    }

    setGeneratedSchedule(finalSchedule);

    if (!finalSchedule.length) {
      setError(
        "No students matched the timetable programmes. Please check the selected Excel columns and programme names."
      );
    }
  }

  const programmeSummary = useMemo(() => {
    const map = new Map<
      string,
      {
        programme: string;
        category: string;
        time: string;
        venue: string;
        students: number;
      }
    >();

    generatedSchedule.forEach((row) => {
      const key = `${row["Programme ID"]}-${row["Programme Name"]}`;

      if (!map.has(key)) {
        map.set(key, {
          programme: String(
            row["Programme Name"] || ""
          ),
          category: String(
            row["Category"] || ""
          ),
          time: String(row["Time"] || ""),
          venue: String(row["Venue"] || ""),
          students: 0,
        });
      }

      const existing = map.get(key)!;

      existing.students += 1;
    });

    return Array.from(map.values());
  }, [generatedSchedule]);

  function printSchedule() {
    if (!generatedSchedule.length) {
      alert("Generate the schedule first.");
      return;
    }

    const grouped = new Map<string, ExcelRow[]>();

    generatedSchedule.forEach((row) => {
      const key = `${row["Programme ID"]}-${row["Programme Name"]}`;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }

      grouped.get(key)!.push(row);
    });

    const sections = Array.from(grouped.values())
      .map((rows) => {
        const first = rows[0];

        const studentRows = rows
          .map(
            (row, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(
                  row["Chest No"]
                )}</td>
                <td>${escapeHtml(
                  row["Student Name"]
                )}</td>
                <td>${escapeHtml(
                  row["Team"]
                )}</td>
              </tr>
            `
          )
          .join("");

        return `
          <section class="programme">
            <h2>
              ${escapeHtml(
                first["Programme Name"]
              )}
            </h2>

            <div class="details">
              <strong>Programme ID:</strong>
              ${escapeHtml(
                first["Programme ID"]
              )}
              &nbsp;&nbsp; | &nbsp;&nbsp;

              <strong>Category:</strong>
              ${escapeHtml(
                first["Category"]
              )}
              &nbsp;&nbsp; | &nbsp;&nbsp;

              <strong>Time:</strong>
              ${escapeHtml(first["Time"])}
              &nbsp;&nbsp; | &nbsp;&nbsp;

              <strong>Venue:</strong>
              ${escapeHtml(first["Venue"])}
            </div>

            <table>
              <thead>
                <tr>
                  <th>Sl. No.</th>
                  <th>Chest No.</th>
                  <th>Student Name</th>
                  <th>Team</th>
                </tr>
              </thead>

              <tbody>
                ${studentRows}
              </tbody>
            </table>
          </section>
        `;
      })
      .join("");

    const printWindow = window.open(
      "",
      "_blank",
      "width=1100,height=800"
    );

    if (!printWindow) {
      alert(
        "Please allow pop-ups for this website."
      );
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>
        <head>
          <title>MUNAFASA 2026 - Off Stage Schedule</title>

          <style>
            @page {
              size: A4;
              margin: 12mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              color: #0f172a;
            }

            .header {
              text-align: center;
              border-bottom: 3px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 24px;
            }

            .school {
              font-size: 22px;
              font-weight: 800;
            }

            .event {
              font-size: 20px;
              font-weight: 800;
              margin-top: 4px;
            }

            .title {
              font-size: 18px;
              margin-top: 5px;
              font-weight: 700;
            }

            .programme {
              margin-bottom: 28px;
              page-break-inside: avoid;
            }

            h2 {
              margin: 0;
              padding: 10px;
              text-align: center;
              border: 2px solid #0f172a;
              font-size: 18px;
            }

            .details {
              padding: 9px;
              border-left: 2px solid #0f172a;
              border-right: 2px solid #0f172a;
              border-bottom: 2px solid #0f172a;
              font-size: 12px;
              text-align: center;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }

            th {
              border: 1px solid #111;
              padding: 7px;
              background: #111;
              color: white;
              font-size: 12px;
            }

            td {
              border: 1px solid #111;
              padding: 7px;
              font-size: 12px;
            }

            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>

        <body>

          <div class="header">
            <div class="school">
              THE GLOBAL PUBLIC SCHOOL
            </div>

            <div class="event">
              MUNAFASA 2026
            </div>

            <div class="title">
              OFF STAGE AUTOMATIC SCHEDULE
            </div>
          </div>

          ${sections}

          <script>
            window.onload = function () {
              window.focus();
              window.print();
            };
          </script>

        </body>
      </html>
    `);

    printWindow.document.close();
  }

  function exportExcel() {
    if (!generatedSchedule.length) {
      alert("Generate the schedule first.");
      return;
    }

    const worksheet =
      XLSX.utils.json_to_sheet(
        generatedSchedule
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Off Stage Schedule"
    );

    XLSX.writeFile(
      workbook,
      "MUNAFASA_2026_Off_Stage_Schedule.xlsx"
    );
  }

  function escapeHtml(value: any) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Automatic Scheduling
          </h1>

          <p className="mt-2 text-slate-600">
            MUNAFASA 2026 — Off Stage Scheduling
          </p>
        </div>

        {/* STEP 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
              1
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Upload Off Stage Excel
              </h2>

              <p className="text-sm text-slate-500">
                Upload the Excel file containing the
                registered students and programmes.
              </p>
            </div>
          </div>

          <label className="block border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition">

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="hidden"
            />

            <div className="text-4xl mb-3">
              📊
            </div>

            <div className="font-semibold text-slate-800">
              Click to upload Excel file
            </div>

            <div className="text-sm text-slate-500 mt-1">
              XLSX / XLS
            </div>

          </label>

          {fileName && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="font-semibold text-emerald-800">
                ✓ {fileName}
              </div>

              <div className="text-sm text-emerald-700 mt-1">
                Sheet: {selectedSheet} ·{" "}
                {excelRows.length} rows detected
              </div>
            </div>
          )}
        </div>

        {/* STEP 2 */}
        {headers.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                2
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Match Excel Columns
                </h2>

                <p className="text-sm text-slate-500">
                  The system detected the columns. Check
                  them before generating the schedule.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              <ColumnSelect
                label="Programme Name *"
                value={programmeColumn}
                options={headers}
                onChange={setProgrammeColumn}
              />

              <ColumnSelect
                label="Programme ID"
                value={programmeIdColumn}
                options={headers}
                onChange={setProgrammeIdColumn}
              />

              <ColumnSelect
                label="Category *"
                value={categoryColumn}
                options={headers}
                onChange={setCategoryColumn}
              />

              <ColumnSelect
                label="Student Name"
                value={studentNameColumn}
                options={headers}
                onChange={setStudentNameColumn}
              />

              <ColumnSelect
                label="Chest No."
                value={chestNoColumn}
                options={headers}
                onChange={setChestNoColumn}
              />

              <ColumnSelect
                label="Team"
                value={teamColumn}
                options={headers}
                onChange={setTeamColumn}
              />

            </div>
          </div>
        )}

        {/* STEP 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
              3
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Tomorrow's Off Stage Timetable
              </h2>

              <p className="text-sm text-slate-500">
                Programme time and venue can be changed
                manually.
              </p>
            </div>
          </div>

          <div className="space-y-4">

            {scheduleItems.map(
              (item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200"
                >

                  <input
                    value={item.category}
                    onChange={(e) =>
                      updateScheduleItem(
                        index,
                        "category",
                        e.target.value
                      )
                    }
                    placeholder="Category"
                    className="border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />

                  <input
                    value={item.time}
                    onChange={(e) =>
                      updateScheduleItem(
                        index,
                        "time",
                        e.target.value
                      )
                    }
                    placeholder="Time"
                    className="border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />

                  <input
                    value={item.programme}
                    onChange={(e) =>
                      updateScheduleItem(
                        index,
                        "programme",
                        e.target.value
                      )
                    }
                    placeholder="Programme"
                    className="border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />

                  <input
                    value={item.venue}
                    onChange={(e) =>
                      updateScheduleItem(
                        index,
                        "venue",
                        e.target.value
                      )
                    }
                    placeholder="Venue"
                    className="border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeScheduleItem(index)
                    }
                    className="bg-red-100 text-red-700 rounded-lg px-3 py-2 font-semibold hover:bg-red-200"
                  >
                    Remove
                  </button>

                </div>
              )
            )}

          </div>

          <button
            type="button"
            onClick={addScheduleItem}
            className="mt-4 bg-slate-800 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-900"
          >
            + Add Programme
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            {error}
          </div>
        )}

        {/* GENERATE */}
        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={generateSchedule}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold"
          >
            ⚙️ Generate Schedule
          </button>

          {generatedSchedule.length > 0 && (
            <>
              <button
                type="button"
                onClick={printSchedule}
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold"
              >
                🖨️ Print / PDF
              </button>

              <button
                type="button"
                onClick={exportExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold"
              >
                📊 Export Excel
              </button>
            </>
          )}

        </div>

        {/* SUMMARY */}
        {generatedSchedule.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

            <div className="flex flex-wrap gap-4 mb-6">

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-4">
                <div className="text-sm text-slate-500">
                  Programmes
                </div>

                <div className="text-2xl font-bold text-indigo-700">
                  {programmeSummary.length}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4">
                <div className="text-sm text-slate-500">
                  Students
                </div>

                <div className="text-2xl font-bold text-emerald-700">
                  {generatedSchedule.length}
                </div>
              </div>

            </div>

            {/* PROGRAMME SUMMARY */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">

                <thead>
                  <tr className="bg-slate-900 text-white">

                    <th className="p-3 text-left">
                      Programme
                    </th>

                    <th className="p-3 text-left">
                      Category
                    </th>

                    <th className="p-3 text-left">
                      Time
                    </th>

                    <th className="p-3 text-left">
                      Venue
                    </th>

                    <th className="p-3 text-center">
                      Students
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {programmeSummary.map(
                    (item, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-200"
                      >

                        <td className="p-3 font-semibold">
                          {item.programme}
                        </td>

                        <td className="p-3">
                          {item.category}
                        </td>

                        <td className="p-3">
                          {item.time}
                        </td>

                        <td className="p-3">
                          {item.venue}
                        </td>

                        <td className="p-3 text-center font-bold">
                          {item.students}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>
            </div>

          </div>
        )}

        {/* STUDENT SCHEDULE */}
        {generatedSchedule.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Generated Student Schedule
            </h2>

            <div className="overflow-x-auto">

              <table className="w-full border-collapse">

                <thead>
                  <tr className="bg-slate-900 text-white">

                    <th className="p-3 text-left">
                      Programme ID
                    </th>

                    <th className="p-3 text-left">
                      Programme
                    </th>

                    <th className="p-3 text-left">
                      Category
                    </th>

                    <th className="p-3 text-left">
                      Time
                    </th>

                    <th className="p-3 text-left">
                      Venue
                    </th>

                    <th className="p-3 text-left">
                      Chest No.
                    </th>

                    <th className="p-3 text-left">
                      Student Name
                    </th>

                    <th className="p-3 text-left">
                      Team
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {generatedSchedule.map(
                    (row, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-200 hover:bg-slate-50"
                      >

                        <td className="p-3">
                          {row["Programme ID"]}
                        </td>

                        <td className="p-3 font-semibold">
                          {row["Programme Name"]}
                        </td>

                        <td className="p-3">
                          {row["Category"]}
                        </td>

                        <td className="p-3">
                          {row["Time"]}
                        </td>

                        <td className="p-3">
                          {row["Venue"]}
                        </td>

                        <td className="p-3 font-bold">
                          {row["Chest No"]}
                        </td>

                        <td className="p-3">
                          {row["Student Name"]}
                        </td>

                        <td className="p-3">
                          {row["Team"]}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

function ColumnSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white"
      >
        <option value="">
          Select column
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}