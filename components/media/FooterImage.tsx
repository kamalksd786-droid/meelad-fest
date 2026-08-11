"use client";

import { Image } from "react-konva";
import useImage from "use-image";

export default function FooterImage() {
  const [image] = useImage("/media/footer/footer.png");

  if (!image) return null;

  return (
    <Image
      image={image}
      x={0}
      y={820}      // Move footer up
      width={700}
      height={130} // Adjust height
    />
  );
}