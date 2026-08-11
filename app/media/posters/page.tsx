"use client";

import { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

import { supabase } from "@/lib/supabase";

import Toolbar from "@/components/media/Toolbar";
import LeftPanel from "@/components/media/LeftPanel";
import RightPanel from "@/components/media/RightPanel";
import PosterCanvas from "@/components/media/PosterCanvas";
import ProgrammeSelector from "@/components/media/ProgrammeSelector";
import StudentList from "@/components/media/StudentList";
import { useBulkPosterGenerator } from "@/components/media/hooks/useBulkPosterGenerator";
import HiddenPoster from "@/components/media/bulk/HiddenPoster";
import ZipExporter from "@/components/media/bulk/zipExporter";

type PosterData = {
  studentName: string;
  programme: string;
  category: string;
  team: string;
  photo: string;
};

export default function PosterDesigner() {
  const posterRef = useRef<HTMLDivElement>(null);
  const hiddenPosterRef = useRef<HTMLDivElement>(null);

  const [selectedTemplate, setSelectedTemplate] =
  useState("participation");

const [programmes, setProgrammes] = useState<any[]>([]);
const [students, setStudents] = useState<any[]>([]);

const [selectedProgramme, setSelectedProgramme] =
  useState("");

const {
  generate,
  isGenerating,
  progress,
  currentStudent,
} = useBulkPosterGenerator();
const [posterData, setPosterData] =
  useState<PosterData>({
    studentName: "",
    programme: "",
    category: "",
    team: "",
    photo: "",
  });

  useEffect(() => {
    loadProgrammes();
  }, []);

  async function loadProgrammes() {
    const { data, error } = await supabase
      .from("programmes")
      .select("*")
      .order("programme_name");

    if (error) {
      console.error(error);
      return;
    }

    setProgrammes(data || []);
  }

  async function loadStudents(programmeId: string) {
  setSelectedProgramme(programmeId);

  // Find selected programme
  const selected = programmes.find(
    (p) => String(p.id) === String(programmeId)
  );

  // Save programme name
  if (selected) {
    setPosterData((prev) => ({
      ...prev,
      programme: selected.programme_name,
    }));
  }

  // Load registered students
  const { data, error } = await supabase
    .from("registrations")
    .select("id, student_name, admission_no")
    .eq("programme_id", programmeId)
    .order("student_name");

  if (error) {
    console.error(error);
    return;
  }

  setStudents(data || []);
}

  async function selectStudent(student: any) {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("admission_no", student.admission_no)
    .single();

  if (error || !data) {
    console.error(error);
    return;
  }

 setPosterData((prev) => ({
  ...prev,
  studentName: data.student_name,

  programme:
    programmes.find(
      p => String(p.id) === String(selectedProgramme)
    )?.programme_name || "",

  category: data.category,

  team: data.team.toUpperCase() + " TEAM",

  photo: data.photo_url || "",
}));
}

 async function exportPNG() {
  if (!posterRef.current) {
    alert("Poster not found.");
    return;
  }

  try {
    const dataUrl = await htmlToImage.toPng(posterRef.current, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "transparent",
    });

    const link = document.createElement("a");
    link.download = `${posterData.studentName || "poster"}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error(err);
    alert("Failed to export PNG.");
  }
}
 async function generateAllPosters() {
  if (students.length === 0) {
    alert("Please select a programme first.");
    return;
  }

  const zip = new ZipExporter();

  for (const student of students) {

    // Update poster
    await selectStudent(student);

    // Wait for React to render
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!posterRef.current) continue;

    // Convert poster to PNG
    const dataUrl = await htmlToImage.toPng(posterRef.current, {
      pixelRatio: 3,
      cacheBust: true,
    });

    // Add PNG to ZIP
   zip.addPoster(
    `${student.admission_no}_${student.student_name}_${posterData.programme}_${posterData.category}_${posterData.team}.png`,
    dataUrl
);
  }

  // Download ZIP
  await zip.download(
    "MUNAFASA_PARTICIPATION_POSTERS.zip"
  );

  alert("ZIP generated successfully.");
}
    return (
    <div className="h-screen flex flex-col bg-gray-100">

      <Toolbar
  onSave={() => alert("Save coming soon")}
  onExportPNG={exportPNG}
  onExportPDF={() => alert("PDF Export coming soon")}
  onGenerateAll={generateAllPosters}
/>
{isGenerating && (
  <div className="bg-white border-b p-3">
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className="bg-purple-600 h-3 rounded-full transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>

    <p className="text-sm mt-2 text-center">
      Generating {currentStudent}

{progress}%
    </p>
  </div>
)}

      <div className="flex flex-1">

        <LeftPanel
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
        />

        <div className="flex-1 flex flex-col p-4">

          <div className="mb-4">
            <ProgrammeSelector
              programmes={programmes}
              selected={selectedProgramme}
              onChange={loadStudents}
            />
          </div>

          <div className="flex flex-1 gap-4">

            <div className="w-72">
              <StudentList
                students={students}
                onSelect={selectStudent}
              />
            </div>

            <div
              ref={posterRef}
              className="flex-1 flex items-center justify-center bg-gray-200 rounded-xl p-4"
            >
              <PosterCanvas
                posterData={posterData}
                template={selectedTemplate}
              />
            </div>

          </div>

        </div>

        <RightPanel
          posterData={posterData}
          setPosterData={setPosterData}
        />

      </div>
      <div ref={hiddenPosterRef}>
  <HiddenPoster
    posterData={posterData}
    template={selectedTemplate}
  />
</div>
          </div>
  );
}