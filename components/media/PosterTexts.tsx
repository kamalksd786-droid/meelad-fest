"use client";

import { Text } from "react-konva";

type Props = {
  studentName: string;
  programme: string;
  category: string;
  team: string;
  template: string;
};

export default function PosterTexts({
  studentName,
  programme,
  category,
  team,
  template,
}: Props) {
  return (
    <>
    <Text
  text={
    template === "winner-first"
      ? "🥇 FIRST PRIZE"
      : template === "winner-second"
      ? "🥈 SECOND PRIZE"
      : template === "winner-third"
      ? "🥉 THIRD PRIZE"
      : "PARTICIPATION"
  }
  x={150}
  y={560}
  width={400}
  align="center"
  fontSize={24}
  fontStyle="bold"
  fill="#C69214"
/>
      {/* Student Name */}
      <Text
        text={studentName}
        x={175}
        y={610}
        width={350}
        align="center"
        fontSize={28}
        fontStyle="bold"
        fill="#0F172A"
      />

      {/* Programme */}
      <Text
        text={programme}
        x={300}
        y={730}
        width={300}
        align="left"
        fontSize={18}
        fontStyle="bold"
        fill="#0F172A"
      />

      {/* Category */}
      <Text
        text={category}
        x={300}
        y={785}
        width={300}
        align="left"
        fontSize={18}
        fontStyle="bold"
        fill="#0F172A"
      />

      {/* Team */}
      <Text
        text={team}
        x={300}
        y={840}
        width={300}
        align="left"
        fontSize={18}
        fontStyle="bold"
        fill="#0F172A"
      />
    </>
  );
}