"use client";

interface Programme {
  id: number;
  programme_code: string;
  programme_name: string;
  participant_type: string;
}

interface Props {
  programmes: Programme[];
  selected: number[];
  onToggle: (id: number) => void;
}

export default function ProgrammeGrid({
  programmes,
  selected,
  onToggle,
}: Props) {
  if (programmes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
        No programmes available.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

      {programmes.map((programme) => {

        const checked = selected.includes(programme.id);

        return (

          <label
            key={programme.id}
            className={`cursor-pointer rounded-xl border-2 p-5 transition ${
              checked
                ? "border-purple-700 bg-purple-50"
                : "border-gray-200 bg-white hover:border-purple-300"
            }`}
          >

            <div className="flex items-start gap-3">

              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(programme.id)}
                className="mt-1 h-5 w-5"
              />

              <div className="flex-1">

                <p className="text-xs text-gray-500">
                  {programme.programme_code}
                </p>

                <h3 className="font-bold text-lg">
                  {programme.programme_name}
                </h3>

                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-gray-100 text-sm">
                  {programme.participant_type}
                </span>

              </div>

            </div>

          </label>

        );

      })}

    </div>
  );
}