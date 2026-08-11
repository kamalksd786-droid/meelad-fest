"use client";

export default function LeftPanel() {
  return (
    <aside className="w-72 bg-white border-r p-5 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">🎨 Templates</h2>

      <div className="space-y-3">
        <button className="w-full rounded-lg bg-green-600 text-white p-3 hover:bg-green-700">
          Participation Poster
        </button>

        <button className="w-full rounded-lg border p-3 hover:bg-gray-100">
          Winner Poster
        </button>

        <button className="w-full rounded-lg border p-3 hover:bg-gray-100">
          Event Poster
        </button>

        <button className="w-full rounded-lg border p-3 hover:bg-gray-100">
          Team Poster
        </button>

        <button className="w-full rounded-lg border p-3 hover:bg-gray-100">
          Certificate
        </button>

        <button className="w-full rounded-lg border p-3 hover:bg-gray-100">
          ID Card
        </button>
      </div>
    </aside>
  );
}