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
}: Props) {
  return (
    <>
      {/* Top Heading */}
      <Text
        text="MUNAFASA 2026"
        x={100}
        y={90}
        width={500}
        align="center"
        fontSize={34}
        fontStyle="bold"
        fill="#F5D27A"
      />

      <Text
        text="THE GLOBAL PUBLIC SHOOL "
        x={100}
        y={135}
        width={500}
        align="center"
        fontSize={20}
        fontStyle="bold"
        fill="#FFF4D6"
      />

      {/* Student Name */}
      <Text
        text={studentName}
        x={70}
        y={565}
        width={560}
        align="center"
        fontSize={32}
        fontStyle="bold"
        fill="#FFF4D6"
      />

      {/* Programme */}
      <Text
        text={`Programme: ${programme}`}
        x={60}
        y={615}
        width={580}
        align="center"
        fontSize={20}
        fontStyle="bold"
        fill="#F5D27A"
      />

      {/* Category */}
      <Text
        text={`Category: ${category}`}
        x={60}
        y={655}
        width={580}
        align="center"
        fontSize={18}
        fontStyle="bold"
        fill="#FFF4D6"
      />

      {/* Team */}
      <Text
        text={team ? `${team.toUpperCase()} TEAM` : ""}
        x={60}
        y={695}
        width={580}
        align="center"
        fontSize={22}
        fontStyle="bold"
        fill="#F5D27A"
      />
    </>
  );
}