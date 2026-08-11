"use client";

import { Image } from "react-konva";
import useImage from "use-image";

type Props = {
  src: string;
};

export default function OverlayImage({ src }: Props) {
  const [image] = useImage(src);

  if (!image) return null;

  return (
    <Image
      image={image}
      x={0}
      y={0}
      width={700}
      height={950}
    />
  );
}