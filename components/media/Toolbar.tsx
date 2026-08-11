"use client";

type Props = {
  onSave: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
  onGenerateAll: () => void;
};

export default function Toolbar({
  onSave,
  onExportPNG,
  onExportPDF,
  onGenerateAll,
}: Props) {
  return (
    <div className="flex items-center justify-between bg-white border-b px-6 py-3">

      <h1 className="text-2xl font-bold flex items-center gap-2">
        🎨 MUNAFASA Design Studio
      </h1>

      <div className="flex gap-3">

        <button
          onClick={onGenerateAll}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold"
        >
          Generate All
        </button>

        <button
          onClick={onSave}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold"
        >
          Save
        </button>

        <button
          onClick={onExportPNG}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold"
        >
          Export PNG
        </button>

        <button
          onClick={onExportPDF}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold"
        >
          Export PDF
        </button>

      </div>

    </div>
  );
}