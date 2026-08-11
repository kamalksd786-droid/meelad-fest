"use client";

import { Image } from "react-konva";
import useImage from "use-image";

type Props = {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function LogoImage({
  src,
  x,
  y,
  width,
  height,
}: Props) {
  const [image] = useImage(src);

  if (!image) return null;

  return (
    <Image
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
    />
  );
}