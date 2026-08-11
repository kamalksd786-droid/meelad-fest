"use client";

import { Image } from "react-konva";
import useImage from "use-image";
import { EditorObject } from "../hooks/useEditor";

type Props = {
  object: EditorObject;
};

export default function ImageObject({ object }: Props) {
  const [image] = useImage(object.src || "");

  if (!image) return null;

  return (
    <Image
      image={image}
      x={object.x}
      y={object.y}
      width={object.width || 100}
      height={object.height || 100}
      draggable
    />
  );
}