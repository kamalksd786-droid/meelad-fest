type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({
  value,
  onChange,
}: Props) {
  return (
    <input
      type="text"
      placeholder="🔍 Search..."
      className="w-full border rounded-lg p-3 mb-6"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}