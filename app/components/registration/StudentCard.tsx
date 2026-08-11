interface StudentProps {
  student: {
    admission_no: string;
    student_name: string;
    class: string;
    house: string;
    category: string;
  };
}

export default function StudentCard({ student }: StudentProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">

      <div className="grid md:grid-cols-5 gap-5">

        <div>
          <p className="text-gray-500">Admission</p>
          <h3 className="font-bold">
            {student.admission_no}
          </h3>
        </div>

        <div>
          <p className="text-gray-500">Student</p>
          <h3 className="font-bold">
            {student.student_name}
          </h3>
        </div>

        <div>
          <p className="text-gray-500">Class</p>
          <h3 className="font-bold">
            {student.class}
          </h3>
        </div>

        <div>
          <p className="text-gray-500">House</p>
          <h3 className="font-bold">
            {student.house}
          </h3>
        </div>

        <div>
          <p className="text-gray-500">Category</p>
          <h3 className="font-bold text-purple-700">
            {student.category}
          </h3>
        </div>

      </div>

    </div>
  );
}