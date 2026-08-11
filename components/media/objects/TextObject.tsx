"use client";

import { Text } from "react-konva";
import { EditorObject } from "../hooks/useEditor";

type Props = {
  object: EditorObject;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
};

export default function TextObject({
  object,
  isSelected,
  onSelect,
  onDragEnd,
}: Props) {
  return (
    <Text
      text={object.text || ""}
      x={object.x}
      y={object.y}
      fontSize={32}
      fill="white"
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) =>
        onDragEnd(e.target.x(), e.target.y())
      }
    />
  );
}