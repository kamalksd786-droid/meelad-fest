"use client";

import { Image, Group, Rect } from "react-konva";
import useImage from "use-image";

type Props = {
  src?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
};

export default function StudentPhoto({
  src,
  x = 0,
  y = 0,
  width = 180,
  height = 260,
  radius = 28,
}: Props) {
  const imagePath =
    src && src.trim() !== ""
      ? src
      : "/media/logos/munafasa-logo.png";

  const [image] = useImage(imagePath, "anonymous");

  if (!image) return null;

  return (
    <Group
      clipFunc={(ctx) => {
        ctx.beginPath();

        const r = Math.min(radius, width / 2, height / 2);

        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        ctx.lineTo(x + width, y + height - r);
        ctx.quadraticCurveTo(
          x + width,
          y + height,
          x + width - r,
          y + height
        );
        ctx.lineTo(x + r, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);

        ctx.closePath();
      }}
    >
      <Image
        image={image}
        x={x}
        y={y}
        width={width}
        height={height}
        crop={{
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        }}
        cornerRadius={radius}
      />

      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        cornerRadius={radius}
        stroke="#E6C15A"
        strokeWidth={4}
      />
    </Group>
  );
}