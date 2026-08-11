"use client";

interface SaveButtonProps {
  loading: boolean;
  onClick: () => void;
}

export default function SaveButton({
  loading,
  onClick,
}: SaveButtonProps) {
  return (
    <div className="flex justify-end mt-8">

      <button
        onClick={onClick}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-bold"
      >
        {loading ? "Saving..." : "Save Programmes"}
      </button>

    </div>
  );
}