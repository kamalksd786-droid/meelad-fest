"use client";

type PosterData = {
  studentName: string;
  programme: string;
  category: string;
  team: string;
};

type Props = {
  posterData: PosterData;
  setPosterData: React.Dispatch<React.SetStateAction<PosterData>>;
};

export default function RightPanel({
  posterData,
  setPosterData,
}: Props) {
  return (
    <aside className="w-80 bg-white border-l p-5 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Properties</h2>

      <div className="space-y-4">

        <input
          className="w-full border rounded-lg p-3"
          value={posterData.studentName}
          onChange={(e) =>
            setPosterData({
              ...posterData,
              studentName: e.target.value,
            })
          }
        />

        <input
          className="w-full border rounded-lg p-3"
          value={posterData.programme}
          onChange={(e) =>
            setPosterData({
              ...posterData,
              programme: e.target.value,
            })
          }
        />

        <input
          className="w-full border rounded-lg p-3"
          value={posterData.category}
          onChange={(e) =>
            setPosterData({
              ...posterData,
              category: e.target.value,
            })
          }
        />

        <input
          className="w-full border rounded-lg p-3"
          value={posterData.team}
          onChange={(e) =>
            setPosterData({
              ...posterData,
              team: e.target.value,
            })
          }
        />

      </div>
    </aside>
  );
}