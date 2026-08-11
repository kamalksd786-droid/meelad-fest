"use client";

type Student = {
  id: number;
  student_name: string;
  admission_no: string;
};

type Props = {
  students: Student[];
  onSelect: (student: Student) => void;
};

export default function StudentList({
  students,
  onSelect,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">
        Registered Students
      </h2>

      {students.length === 0 ? (
        <p className="text-gray-500">
          Select a programme first.
        </p>
      ) : (
        students.map((student) => (
          <button
  key={student.admission_no}
            onClick={() => onSelect(student)}
            className="w-full text-left p-3 mb-2 rounded-lg hover:bg-green-100 border"
          >
            <div className="font-semibold">
              {student.student_name}
            </div>

            <div className="text-sm text-gray-500">
              Admission No: {student.admission_no}
            </div>
          </button>
        ))
      )}
    </div>
  );
}