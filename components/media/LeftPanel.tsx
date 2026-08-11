"use client";

type Props = {
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
};

const templates = [
  {
    id: "participation",
    name: "Participation",
    color: "bg-green-600",
  },
  {
    id: "winner-first",
    name: "🥇 First Prize",
    color: "bg-yellow-500",
  },
  {
    id: "winner-second",
    name: "🥈 Second Prize",
    color: "bg-gray-500",
  },
  {
    id: "winner-third",
    name: "🥉 Third Prize",
    color: "bg-orange-600",
  },
  {
    id: "event",
    name: "Event",
    color: "bg-blue-600",
  },
  {
    id: "team",
    name: "Team Poster",
    color: "bg-purple-600",
  },
];

export default function LeftPanel({
  selectedTemplate,
  setSelectedTemplate,
}: Props) {
  return (
    <aside className="w-72 bg-white border-r p-5">
      <h2 className="text-2xl font-bold mb-6">
        🎨 Templates
      </h2>

      <div className="space-y-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`w-full rounded-lg p-4 text-white font-semibold transition
              ${
                selectedTemplate === template.id
                  ? `${template.color} scale-105`
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
          >
            {template.name}
          </button>
        ))}
      </div>
    </aside>
  );
}