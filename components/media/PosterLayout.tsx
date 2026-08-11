"use client";

import ProgrammeSelector from "./ProgrammeSelector";
import StudentList from "./StudentList";
import PosterCanvas from "./PosterCanvas";

type Props = {
  programmes: any[];
  students: any[];
  selectedProgramme: string;
  onProgrammeChange: (value: string) => void;
  onStudentSelect: (student: any) => void;
  posterData: any;
  template: string;
};

export default function PosterLayout({
  programmes,
  students,
  selectedProgramme,
  onProgrammeChange,
  onStudentSelect,
  posterData,
  template,
}: Props) {
  return (
    <div className="flex flex-1 gap-5 p-5">

      {/* Left */}
      <div className="w-80 flex flex-col gap-4">

        <ProgrammeSelector
          programmes={programmes}
          selected={selectedProgramme}
          onChange={onProgrammeChange}
        />

        <StudentList
          students={students}
          onSelect={onStudentSelect}
        />

      </div>

      {/* Right */}
      <div className="flex-1 bg-gray-100 rounded-xl flex items-center justify-center">

        <PosterCanvas
          posterData={posterData}
          template={template}
        />

      </div>

    </div>
  );
}