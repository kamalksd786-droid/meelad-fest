"use client";

import { Image } from "react-konva";
import useImage from "use-image";

type Props = {
  template: string;
};

export default function WinnerBadge({ template }: Props) {
  let src = "";

  if (template === "winner-first") {
    src = "/media/icons/first-badge.png";
  } else if (template === "winner-second") {
    src = "/media/icons/second-badge.png";
  } else if (template === "winner-third") {
    src = "/media/icons/third-badge.png";
  } else {
    return null;
  }

  const [image] = useImage(src);

  if (!image) return null;

  return (
    <Image
      image={image}
      x={270}
      y={120}
      width={160}
      height={160}
    />
  );
}