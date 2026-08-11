"use client";

type Props = {
  template: string;
};

export default function CertificateBackground({
  template,
}: Props) {
  return (
   <img
  src={`/media/certificates/${template}.png`}
  alt=""
  className="absolute inset-0 w-full h-full"
/>
  );
}