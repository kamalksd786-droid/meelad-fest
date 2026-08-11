"use client";

type Props = {
  src: string;
  left: number;
  top: number;
  title: string;
};

export default function CertificateSignature({
  src,
  left,
  top,
  title,
}: Props) {
  return (
    <>
      <img
        src={src}
        alt={title}
        style={{
          position: "absolute",
          left,
          top,
          width: 170,
        }}
      />

      <p
        style={{
          position: "absolute",
          left,
          top: top + 80,
          width: 170,
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        {title}
      </p>
    </>
  );
}