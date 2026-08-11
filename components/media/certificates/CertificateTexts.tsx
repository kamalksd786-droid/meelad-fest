"use client";

type Props = {
  studentName: string;
  programme: string;
  category: string;
  team: string;
};

export default function CertificateTexts({
  studentName,
  programme,
  category,
  team,
}: Props) {
  return (
    <>
      <h1
        style={{
          position: "absolute",
          top: 300,
          width: "100%",
          textAlign: "center",
          fontSize: 52,
          fontWeight: "bold",
        }}
      >
        {studentName}
      </h1>

      <p
        style={{
          position: "absolute",
          top: 390,
          width: "100%",
          textAlign: "center",
          fontSize: 28,
        }}
      >
        {programme}
      </p>

      <p
        style={{
          position: "absolute",
          top: 440,
          width: "100%",
          textAlign: "center",
          fontSize: 24,
        }}
      >
        {category}
      </p>

      <p
        style={{
          position: "absolute",
          top: 490,
          width: "100%",
          textAlign: "center",
          fontSize: 24,
        }}
      >
        {team}
      </p>
    </>
  );
}