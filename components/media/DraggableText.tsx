"use client";

import { Image } from "react-konva";
import useImage from "use-image";

type Props = {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onMove: (x: number, y: number) => void;
};

export default function DraggablePhoto({
  src,
  x,
  y,
  width,
  height,
  onMove,
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
      cornerRadius={75}
      draggable
      onDragEnd={(e) => {
        onMove(e.target.x(), e.target.y());
      }}
    />
  );
}