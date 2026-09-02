"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

import Toolbar from "@/components/media/Toolbar";
import ProgrammeSelector from "@/components/media/ProgrammeSelector";
import StudentList from "@/components/media/StudentList";

import CertificateCanvas from "@/components/media/certificates/CertificateCanvas";
import CertificateLeftPanel from "@/components/media/certificates/CertificateLeftPanel";
import CertificateRightPanel from "@/components/media/certificates/CertificateRightPanel";

export default function CertificatePage() {
  const certificateRef = useRef<HTMLDivElement>(null);

  const [selectedTemplate, setSelectedTemplate] =
    useState("participation");

  const [programmes, setProgrammes] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedProgramme, setSelectedProgramme] =
    useState("");

 const [certificateData, setCertificateData] = useState({
  studentName: "",
  admissionNo: "",
  programme: "",
  category: "",
  team: "",
  certificateNo: "",
  date: "",
  achievement: "PARTICIPATION",
});

  useEffect(() => {
    loadProgrammes();
  }, []);

  async function loadProgrammes() {
    const { data } = await supabase
      .from("programmes")
      .select("*")
      .order("programme_name");

    setProgrammes(data || []);
  }

  async function loadStudents(programmeId: string) {
    setSelectedProgramme(programmeId);

    const { data } = await supabase
      .from("registrations")
      .select("id, student_name, admission_no")
      .eq("programme_id", programmeId)
      .order("student_name");

    setStudents(data || []);
  }

 async function selectStudent(student: any) {
  const programmeName =
    programmes.find(
      (p) => String(p.id) === String(selectedProgramme)
    )?.programme_name || "";

  // Get student details
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("admission_no", student.admission_no)
    .single();

  if (error || !data) {
    console.error(error);
    return;
  }

  // Get ONLY the published result for this student
  const { data: result, error: resultError } = await supabase
    .from("results")
    .select("position, published")
    .eq("admission_no", student.admission_no)
    .eq("programme_id", Number(selectedProgramme))
    .eq("published", true)
    .maybeSingle();

  if (resultError) {
    console.error(resultError);
  }

  // Convert result position into certificate wording
  let achievement = "PARTICIPATION";

  if (result?.position === "First") {
    achievement = "FIRST PLACE";
  } else if (result?.position === "Second") {
    achievement = "SECOND PLACE";
  } else if (result?.position === "Third") {
    achievement = "THIRD PLACE";
  }

  setCertificateData((previous) => ({
    ...previous,

    studentName:
      data.student_name || student.student_name || "",

    admissionNo:
      data.admission_no || student.admission_no || "",

    programme: programmeName,

    category: data.category || "",

    team: data.team || "",

    achievement,
  }));
}
 async function exportPNG() {
  if (!certificateRef.current) return;

  const { exportCertificate } = await import(
    "@/components/media/certificates/exportCertificate"
  );

  await exportCertificate(
    certificateRef.current,
    certificateData.studentName || "Certificate"
  );
}

async function exportPDF() {
  if (!certificateRef.current) return;

  const { exportCertificatePDF } = await import(
    "@/components/media/certificates/exportCertificatePDF"
  );

  await exportCertificatePDF(
    certificateRef.current,
    certificateData.studentName || "Certificate"
  );
}

   return (
    <div className="h-screen flex flex-col bg-gray-100">

      <Toolbar
        onSave={() => {}}
        onExportPNG={exportPNG}
        onExportPDF={exportPDF}
        onGenerateAll={() => {}}
      />

      <div className="flex flex-1">

        <CertificateLeftPanel
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
        />

        <div className="flex-1 flex flex-col p-4">

          {/* Programme Selector */}
          <div className="mb-4">
            <ProgrammeSelector
              programmes={programmes}
              selected={selectedProgramme}
              onChange={loadStudents}
            />
          </div>

          <div className="flex flex-1 gap-4">

            {/* Student List */}
            <div className="w-72">
              <StudentList
                students={students}
                onSelect={selectStudent}
              />
            </div>

            {/* Certificate Preview */}
            <div className="flex-1 flex items-center justify-center bg-gray-200 rounded-xl p-4">

              <div ref={certificateRef}>
               <CertificateCanvas
  template={selectedTemplate}
  studentName={certificateData.studentName}
  admissionNo={certificateData.admissionNo}
  programme={certificateData.programme}
  category={certificateData.category}
  team={certificateData.team}
  achievement={certificateData.achievement}
/>
              </div>

            </div>

          </div>

        </div>

       <CertificateRightPanel
  certificateData={certificateData}
  setCertificateData={setCertificateData}
/>

      </div>

    </div>
  );
}