"use client";

import CertificateBackground from "./CertificateBackground";
import CertificateTexts from "./CertificateTexts";
import CertificateSignature from "./CertificateSignature";
import CertificateSeal from "./CertificateSeal";

type Props = {
  template: string;
  studentName: string;
  programme: string;
  category: string;
  team: string;
  admissionNo?: string;
  achievement?: string;
};

export default function CertificateCanvas({
  template,
  studentName,
  programme,
  category,
  team,
  admissionNo = "",
  achievement = "PARTICIPATION",
}: Props) {
  return (
    <div
      className="bg-white shadow-2xl"
      style={{
        width: 1123,
        height: 794,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background */}
      <CertificateBackground />

      {/* SCHOOL LOGO */}
      <img
        src="/media/logos/gps-logo.png"
        alt="THE GLOBAL PUBLIC SHOOL "
        style={{
          position: "absolute",
          top: 45,
          left: 75,
          width: 125,
          height: 95,
          objectFit: "contain",
          zIndex: 5,
        }}
      />

      {/* MUNAFASA LOGO */}
      <img
        src="/media/logos/munafasa-logo.png"
        alt="MUNAFASA 2026"
        style={{
          position: "absolute",
          top: 45,
          right: 75,
          width: 125,
          height: 95,
          objectFit: "contain",
          zIndex: 5,
        }}
      />

      {/* TWO-LINE CERTIFICATE CONTENT */}
      <CertificateTexts
        studentName={studentName}
        programme={programme}
        category={category}
        team={team}
        admissionNo={admissionNo}
        achievement={achievement}
      />

      {/* PRINCIPAL SIGNATURE */}
      <CertificateSignature
        src="/media/signatures/principal.png"
        left={120}
        top={620}
        title="Principal"
      />

      {/* COORDINATOR SIGNATURE */}
      <CertificateSignature
        src="/media/signatures/coordinator.png"
        left={420}
        top={620}
        title="Coordinator"
      />

      {/* SCHOOL SEAL */}
      <CertificateSeal />
    </div>
  );
}