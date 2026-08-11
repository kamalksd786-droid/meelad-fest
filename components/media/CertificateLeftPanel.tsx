"use client";

type Props = {
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
};

const templates = [
  {
    id: "participation",
    name: "📜 Participation",
    color: "bg-green-600",
  },
  {
    id: "winner",
    name: "🏆 Winner",
    color: "bg-yellow-600",
  },
  {
    id: "volunteer",
    name: "🤝 Volunteer",
    color: "bg-blue-600",
  },
  {
    id: "judge",
    name: "⚖ Judge",
    color: "bg-purple-600",
  },
  {
    id: "appreciation",
    name: "🌟 Appreciation",
    color: "bg-pink-600",
  },
];

export default function CertificateLeftPanel({
  selectedTemplate,
  setSelectedTemplate,
}: Props) {
  return (
    <div className="w-60 bg-white border-r p-5">
      <h2 className="text-2xl font-bold mb-6">
        📜 Templates
      </h2>

      <div className="space-y-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`w-full rounded-lg p-3 text-white font-semibold transition ${
              selectedTemplate === template.id
                ? `${template.color} scale-105`
                : "bg-gray-500 hover:bg-gray-600"
            }`}
          >
            {template.name}
          </button>
        ))}
      </div>
    </div>
  );
}