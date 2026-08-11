"use client";

import PosterLayout from "./PosterLayout";

type Props = {
  programmes: any[];
  students: any[];
  selectedProgramme: string;
  onProgrammeChange: (value: string) => void;
  onStudentSelect: (student: any) => void;
  posterData: any;
  template: string;
};

export default function PosterWorkspace(props: Props) {
  return (
    <div className="flex-1 bg-gray-100">
      <PosterLayout {...props} />
    </div>
  );
}