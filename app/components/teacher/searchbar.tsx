"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBox({
  value,
  onChange,
}: Props) {
  return (
    <div className="mb-6">

      <input
        type="text"
        placeholder="🔍 Search programme..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-purple-600 focus:outline-none"
      />

    </div>
  );
}