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

      {/* Background */}
     <BackgroundImage
  src={`/media/backgrounds/${template}.png`}
/>

<WinnerBadge template={template} />

<WinnerRibbon template={template} />

      {/* Student Photo */}
      <StudentPhoto
        src={posterData.photo}
        x={350}
        y={385}
        radius={90}
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
{/* <FooterImage /> */}

    </Layer>
  </Stage>
    );
  }
);

PosterCanvas.displayName = "PosterCanvas";

export default PosterCanvas;