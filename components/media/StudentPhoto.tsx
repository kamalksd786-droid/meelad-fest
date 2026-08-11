"use client";

import { Image, Group, Circle } from "react-konva";
import useImage from "use-image";

type Props = {
  src?: string;
  x?: number;
  y?: number;
  radius?: number;
};

export default function StudentPhoto({
  src,
  x,
  y,
  radius,
}: Props) {

  // Use student photo if available, otherwise use MUNAFASA logo
  const imagePath =
    src && src.trim() !== ""
      ? src
      : "/media/logos/munafasa-logo.png";

  const [image] = useImage(imagePath, "anonymous");

  if (!image) return null;

  const photoRadius = radius ?? 75;
  const photoX = x ?? 350;
  const photoY = y ?? 365;

  return (
    <Group
      clipFunc={(ctx) => {
        ctx.beginPath();
        ctx.arc(photoX, photoY, photoRadius, 0, Math.PI * 2);
        ctx.closePath();
      }}
    >
      <Image
        image={image}
        x={photoX - photoRadius}
        y={photoY - photoRadius}
        width={photoRadius * 2}
        height={photoRadius * 2}
      />

      <Circle
        x={photoX}
        y={photoY}
        radius={photoRadius}
        stroke="#FFD700"
        strokeWidth={5}
      />
    </Group>
  );
}