"use client";

type Winner = {
  studentName: string;
  team: string;
  photo: string;
  position: 1 | 2 | 3;
};

type PosterData = {
  studentName: string;
  programme: string;
  category: string;
  team: string;
  photo: string;
  winners: Winner[];
};

type Props = {
  posterData: PosterData;
  setPosterData: React.Dispatch<
    React.SetStateAction<PosterData>
  >;
};

export default function RightPanel({
  posterData,
  setPosterData,
}: Props) {
  const updateField = (
    field: keyof PosterData,
    value: string
  ) => {
    setPosterData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <aside className="w-80 bg-white border-l p-5 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">
        Winner Poster
      </h2>

      <div className="space-y-5">

        {/* Programme */}
        <div>
          <label className="block mb-1 font-medium">
            Programme
          </label>

          <input
            className="w-full border rounded-lg p-3"
            value={posterData.programme}
            onChange={(e) =>
              updateField("programme", e.target.value)
            }
          />
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1 font-medium">
            Category
          </label>

          <input
            className="w-full border rounded-lg p-3"
            value={posterData.category}
            onChange={(e) =>
              updateField("category", e.target.value)
            }
          />
        </div>

        {/* Winners */}
        <div>
          <h3 className="font-bold text-lg mb-3">
            Winners
          </h3>

          {posterData.winners.length === 0 ? (
            <div className="rounded-lg bg-gray-100 p-4 text-sm text-gray-600">
              Select a programme with published
              1st, 2nd or 3rd place results.
            </div>
          ) : (
            <div className="space-y-3">

              {[1, 2, 3].map((position) => {
                const winner =
                  posterData.winners.find(
                    (w) => w.position === position
                  );

                return (
                  <div
                    key={position}
                    className="border rounded-lg p-3"
                  >
                    <div className="font-bold mb-2">
                      {position === 1 && "🥇 1st Place"}
                      {position === 2 && "🥈 2nd Place"}
                      {position === 3 && "🥉 3rd Place"}
                    </div>

                    {winner ? (
                      <>
                        <p className="text-sm font-medium">
                          {winner.studentName}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {winner.team
                            ? `${winner.team.toUpperCase()} TEAM`
                            : ""}
                        </p>

                        {winner.photo ? (
                          <p className="text-xs text-green-600 mt-2">
                            ✓ Photo connected
                          </p>
                        ) : (
                          <p className="text-xs text-red-500 mt-2">
                            ✕ Photo not found
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">
                        No published result
                      </p>
                    )}
                  </div>
                );
              })}

            </div>
          )}
        </div>

        {/* Information */}
        <div className="rounded-lg bg-blue-50 p-4 text-sm">
          <p className="font-semibold mb-1">
            Automatic Winner Poster
          </p>

          <p className="text-gray-600">
            Student names, teams and photos are loaded
            automatically from Supabase using the
            published result admission numbers.
          </p>
        </div>

      </div>
    </aside>
  );
}