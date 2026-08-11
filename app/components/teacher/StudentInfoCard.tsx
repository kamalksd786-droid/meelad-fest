interface Student {
  admission_no: string;
  student_name: string;
  class: string;
  category: string;
  team: string;
}

interface Props {
  student: Student;
  totalProgrammes: number;
}

export default function StudentInfoCard({
  student,
  totalProgrammes,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h2 className="text-3xl font-bold">
            {student.student_name}
          </h2>

          <p className="text-gray-500">
            Admission No : {student.admission_no}
          </p>
        </div>

        <div className="bg-purple-700 text-white px-6 py-3 rounded-xl text-center">

          <p className="text-sm">
            Assigned
          </p>

          <h3 className="text-2xl font-bold">
            {totalProgrammes}
          </h3>

        </div>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="bg-gray-100 rounded-lg p-4">

          <p className="text-gray-500 text-sm">
            Class
          </p>

          <h4 className="font-bold">
            {student.class}
          </h4>

        </div>

        <div className="bg-gray-100 rounded-lg p-4">

          <p className="text-gray-500 text-sm">
            Category
          </p>

          <h4 className="font-bold">
            {student.category}
          </h4>

        </div>

        <div className="bg-gray-100 rounded-lg p-4">

          <p className="text-gray-500 text-sm">
            Team
          </p>

          <h4 className="font-bold uppercase">
            {student.team}
          </h4>

        </div>

        <div className="bg-gray-100 rounded-lg p-4">

          <p className="text-gray-500 text-sm">
            Status
          </p>

          <h4 className="font-bold text-green-600">
            Active
          </h4>

        </div>

      </div>

    </div>
  );
}