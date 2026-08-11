"use client";

interface Programme {
  id: number;
  programme_name: string;
}

interface ProgrammeSectionProps {
  title: string;
  programmes: Programme[];
  selected: number[];
  onToggle: (id: number) => void;
}

export default function ProgrammeSection({
  title,
  programmes,
  selected,
  onToggle,
}: ProgrammeSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow mb-6">

      {/* Header */}
      <div className="bg-purple-700 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
        <h2 className="text-xl font-bold">{title}</h2>

        <span className="bg-white text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
          Selected: {selected.length}
        </span>
      </div>

      {/* Programme List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">

        {programmes.length === 0 ? (
          <p className="text-gray-500">No programmes available.</p>
        ) : (
          programmes.map((programme) => (
            <label
              key={programme.id}
              className="border rounded-lg p-4 hover:bg-purple-50 cursor-pointer flex items-center"
            >
              <input
                type="checkbox"
                checked={selected.includes(programme.id)}
                onChange={() => onToggle(programme.id)}
                className="mr-3 h-4 w-4"
              />

              <span>{programme.programme_name}</span>
            </label>
          ))
        )}

      </div>

    </div>
  );
}