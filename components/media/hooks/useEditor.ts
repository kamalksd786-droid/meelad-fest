import { useState } from "react";

export type EditorObject = {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  text?: string;
  src?: string;
};

export default function useEditor() {
  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [objects, setObjects] = useState<EditorObject[]>([
    {
      id: "title",
      type: "text",
      x: 180,
      y: 40,
      text: "MUNAFASA 2026",
    },
    {
      id: "student",
      type: "text",
      x: 180,
      y: 380,
      text: "Student Name",
    },
    {
      id: "programme",
      type: "text",
      x: 180,
      y: 430,
      text: "Programme",
    },
  ]);

  function updateObject(
    id: string,
    values: Partial<EditorObject>
  ) {
    setObjects((prev) =>
      prev.map((obj) =>
        obj.id === id
          ? { ...obj, ...values }
          : obj
      )
    );
  }

  return {
    objects,
    updateObject,
    selectedId,
    setSelectedId,
  };
}