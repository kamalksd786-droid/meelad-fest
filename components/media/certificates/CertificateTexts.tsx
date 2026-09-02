"use client";

type Props = {
  studentName: string;
  programme: string;
  category: string;
  team: string;
  admissionNo?: string;
  achievement?: string;
};

export default function CertificateTexts({
  studentName,
  programme,
  category,
  team,
  admissionNo = "",
  achievement = "PARTICIPATION",
}: Props) {
  return (
    <>
      {/* LINE 1 */}
      <div
        style={{
          position: "absolute",
          top: 335,
          left: 70,
          width: 983,
          textAlign: "center",
          fontSize: 25,
          fontWeight: 700,
          color: "#173F3F",
          whiteSpace: "nowrap",
          zIndex: 4,
        }}
      >
        Mr./Mrs. {studentName}
        {"    "}
        Admission No: {admissionNo}
      </div>

      {/* LINE 2 */}
      <div
        style={{
          position: "absolute",
          top: 385,
          left: 50,
          width: 1023,
          textAlign: "center",
          fontSize: 21,
          fontWeight: 700,
          color: "#173F3F",
          whiteSpace: "nowrap",
          zIndex: 4,
        }}
      >
        for securing {achievement}
        {"    "}
        Programme: {programme}
        {"    "}
        Category: {category}
        {"    "}
        Team: {team}
      </div>
    </>
  );
}