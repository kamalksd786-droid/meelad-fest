"use client";

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  {
    id: "Stage",
    icon: "🎭",
    label: "Stage",
  },
  {
    id: "Off Stage",
    icon: "🎤",
    label: "Off Stage",
  },
  {
    id: "Group",
    icon: "👥",
    label: "Group",
  },
  {
    id: "General",
    icon: "📚",
    label: "General",
  },
];

export default function ProgrammeTabs({
  activeTab,
  setActiveTab,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-2 mb-6">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

        {tabs.map((tab) => (

          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg p-4 transition font-semibold ${
              activeTab === tab.id
                ? "bg-purple-700 text-white"
                : "hover:bg-purple-100"
            }`}
          >
            <div className="text-2xl mb-1">
              {tab.icon}
            </div>

            {tab.label}

          </button>

        ))}

      </div>

    </div>
  );
}