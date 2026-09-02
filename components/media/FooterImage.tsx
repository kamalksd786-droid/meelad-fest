"use client";

import { Text, Line } from "react-konva";

export default function FooterImage() {
  return (
    <>
      {/* Footer separator */}
      <Line
        points={[70, 825, 630, 825]}
        stroke="#F5D27A"
        strokeWidth={1}
        opacity={0.8}
      />

      {/* Affiliation */}
      <Text
        text="Affiliated to CBSE New Delhi (930820)"
        x={50}
        y={838}
        width={600}
        align="center"
        fontSize={13}
        fontStyle="bold"
        fill="#FFF4D6"
      />

      {/* Address */}
      <Text
        text="Global Street, Meginadka, Manya P.O., Ullodi,"
        x={40}
        y={858}
        width={620}
        align="center"
        fontSize={12}
        fill="#FFF4D6"
      />

      <Text
        text="Kasargod, Kerala - 671321"
        x={40}
        y={876}
        width={620}
        align="center"
        fontSize={12}
        fill="#FFF4D6"
      />

      {/* Phone */}
      <Text
        text="Ph: +91 7012431351,  -----------  +91 97463915594"
        x={40}
        y={895}
        width={620}
        align="center"
        fontSize={12}
        fontStyle="bold"
        fill="#F5D27A"
      />
    </>
  );
}