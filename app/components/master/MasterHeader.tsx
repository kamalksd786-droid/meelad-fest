type Props = {
  title: string;
  description: string;
  buttonText: string;
  onAdd: () => void;
};

export default function MasterHeader({
  title,
  description,
  buttonText,
  onAdd,
}: Props) {
  return (
    <div className="flex justify-between items-center mb-8">

      <div>
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="text-gray-500 mt-2">{description}</p>
      </div>

      <button
        onClick={onAdd}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
      >
        {buttonText}
      </button>

    </div>
  );
}