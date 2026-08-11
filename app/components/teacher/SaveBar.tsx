"use client";

interface Props {
  totalSelected: number;
  saving: boolean;
  onSave: () => void;
}

export default function SaveBar({
  totalSelected,
  saving,
  onSave,
}: Props) {
  return (
    <div className="sticky bottom-0 mt-8 bg-white border-t shadow-lg rounded-t-xl p-4">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-gray-500 text-sm">
            Selected Programmes
          </p>

          <h2 className="text-2xl font-bold text-purple-700">
            {totalSelected}
          </h2>

        </div>

        <button
          onClick={onSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-bold"
        >
          {saving ? "Saving..." : "Save Programmes"}
        </button>

      </div>

    </div>
  );
}