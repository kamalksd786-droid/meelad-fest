"use client";

import { Image } from "react-konva";
import useImage from "use-image";

type Props = {
  template: string;
};

export default function WinnerRibbon({ template }: Props) {
  let src = "";

  if (template === "winner-first") {
    src = "/media/ribbons/first-ribbon.png";
  } else if (template === "winner-second") {
    src = "/media/ribbons/second-ribbon.png";
  } else if (template === "winner-third") {
    src = "/media/ribbons/third-ribbon.png";
  } else {
    return null;
  }

  const [image] = useImage(src);

  if (!image) return null;

  return (
    <Image
      image={image}
     x={80}
  y={555}
  width={540}
  height={90}
    />
  );
}