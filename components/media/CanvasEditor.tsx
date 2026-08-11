"use client";

import { templates } from "@/lib/posterTemplates";
import { Stage, Layer, Rect, Text, Circle } from "react-konva";

type PosterData = {
  studentName: string;
  programme: string;
  category: string;
  team: string;
};

type Props = {
  posterData: PosterData;
  template: string;
};

export default function CanvasEditor({
  posterData,
  template,
}: Props) {
  const design =
    templates[template as keyof typeof templates];

  return (
    <div className="bg-gray-200 p-6 rounded-lg">
      <Stage width={600} height={850}>
        <Layer>

          {/* Background */}
          <Rect
            width={600}
            height={850}
            fill={design.bg}
          />

          {/* Title */}
          <Text
            text={design.title}
            x={120}
            y={40}
            fontSize={36}
            fontStyle="bold"
            fill="white"
          />

          {/* Photo Placeholder */}
          <Circle
            x={300}
            y={220}
            radius={70}
            stroke="white"
            strokeWidth={4}
          />

          {/* Student Name */}
          <Text
            text={posterData.studentName}
            x={120}
            y={360}
            fontSize={32}
            fill="white"
            draggable
          />

          {/* Programme */}
          <Text
            text={posterData.programme}
            x={120}
            y={420}
            fontSize={24}
            fill="white"
            draggable
          />

          {/* Category */}
          <Text
            text={posterData.category}
            x={120}
            y={460}
            fontSize={22}
            fill="white"
            draggable
          />

          {/* Team */}
          <Text
            text={posterData.team}
            x={180}
            y={760}
            fontSize={28}
            fill={design.teamColor}
            draggable
          />

        </Layer>
      </Stage>
    </div>
  );
}