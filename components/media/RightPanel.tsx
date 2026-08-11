"use client";

type PosterData = {
  studentName: string;
  programme: string;
  category: string;
  team: string;
  photo: string;
};

type Props = {
  posterData: PosterData;
  setPosterData: React.Dispatch<React.SetStateAction<PosterData>>;
};

export default function RightPanel({
  posterData,
  setPosterData,
}: Props) {
  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setPosterData({
        ...posterData,
        photo: reader.result as string,
      });
    };

    reader.readAsDataURL(file);
  };

  return (
    <aside className="w-80 bg-white border-l p-5 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">
        Poster Properties
      </h2>

      <div className="space-y-4">

        <div>
          <label className="block mb-1 font-medium">
            Student Name
          </label>

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
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Programme
          </label>

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
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Category
          </label>

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
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Team
          </label>

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

        <div>
          <label className="block mb-2 font-medium">
            Student Photo
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
          />
        </div>

      </div>
    </aside>
  );
}