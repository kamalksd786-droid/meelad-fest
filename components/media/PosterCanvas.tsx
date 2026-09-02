"use client";

import { Stage, Layer } from "react-konva";
import { forwardRef } from "react";
import type Konva from "konva";

import BackgroundImage from "./BackgroundImage";
import StudentPhoto from "./StudentPhoto";
import PosterTexts from "./PosterTexts";
import FooterImage from "./FooterImage";
import WinnerBadge from "./WinnerBadge";
import WinnerRibbon from "./WinnerRibbon";
import LogoImage from "./LogoImage";


type PosterData = {
  studentName: string;
  programme: string;
  category: string;
  team: string;
  photo: string;
};

type Props = {
  posterData: PosterData;
  template: string;
};

const PosterCanvas = forwardRef<Konva.Stage, Props>(
  ({ posterData, template }, ref) => {

  return (
  <Stage
  ref={ref}
  width={700}
  height={950}
  pixelRatio={3}
>
    <Layer>
      <LogoImage
  src="/media/logos/munafasa-logo.png"
  x={285}
  y={175}
  width={130}
  height={70}
/>

      <BackgroundImage
  src="/media/posters/poster-background..png"
/>

{/* School Logo — Top Left */}
<LogoImage
  src="/media/logos/gps-logo.png"
  x={35}
  y={35}
  width={100}
  height={80}
/>

{/* MUNAFASA Logo — Top Right */}
<LogoImage
  src="/media/logos/munafasa-logo.png"
  x={550}
  y={25}
  width={125}
  height={95}
/>

<WinnerBadge template={template} />

<WinnerRibbon template={template} />

      {/* Student Photo */}
      <StudentPhoto
        src={posterData.photo}
       x={350}
y={400}
radius={120}
      />

      {/* Poster Text */}
      <PosterTexts
  studentName={posterData.studentName}
  programme={posterData.programme}
  category={posterData.category}
  team={posterData.team}
  template={template}
/>

    {/* Footer */}
<FooterImage />
    </Layer>
  </Stage>
    );
  }
);

PosterCanvas.displayName = "PosterCanvas";

export default PosterCanvas;