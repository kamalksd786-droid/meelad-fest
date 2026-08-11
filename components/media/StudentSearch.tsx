"use client";

type Props = {
  students: any[];
  onSelect: (student: any) => void;
};

export default function StudentSearch({
  students,
  onSelect,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4 w-80 max-h-96 overflow-auto">
      <h2 className="font-bold mb-3">
        Students
      </h2>

      {students.map((student) => (
        <button
          key={student.id}
          onClick={() => onSelect(student)}
          className="w-full text-left p-3 hover:bg-gray-100 rounded"
        >
          {student.student_name}
        </button>
      ))}
    </div>
  );
}