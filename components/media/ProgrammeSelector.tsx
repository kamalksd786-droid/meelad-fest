"use client";

type Programme = {
  id: number;
  programme_name: string;
};

type Props = {
  programmes: Programme[];
  selected: string;
  onChange: (value: string) => void;
};

export default function ProgrammeSelector({
  programmes,
  selected,
  onChange,
}: Props) {
  return (
    <select
      className="border rounded-lg p-3 w-full"
      value={selected}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select Programme</option>

      {programmes.map((programme) => (
        <option key={programme.id} value={programme.id}>
          {programme.programme_name}
        </option>
      ))}
    </select>
  );
}