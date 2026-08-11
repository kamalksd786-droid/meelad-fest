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
};

export default function CertificateCanvas({
  template,
  studentName,
  programme,
  category,
  team,
}: Props) {
  return (
    <div
      className="bg-white shadow-2xl"
      style={{
        width: 1123,
        height: 794,
        position: "relative",
      }}
    >
     <CertificateBackground template={template} />

      <CertificateTexts
        studentName={studentName}
        programme={programme}
        category={category}
        team={team}
      />
      <CertificateSignature
  src="/media/signatures/principal.png"
  left={120}
  top={620}
  title="Principal"
/>

<CertificateSignature
  src="/media/signatures/manager.png"
  left={420}
  top={620}
  title="Manager"
/>

<CertificateSeal />
    </div>
  );
}