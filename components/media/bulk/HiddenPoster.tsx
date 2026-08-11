"use client";

import { forwardRef } from "react";
import type Konva from "konva";
import PosterCanvas from "../PosterCanvas";

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

const HiddenPoster = forwardRef<Konva.Stage, Props>(
  ({ posterData, template }, ref) => {
    return (
      <div
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
        }}
      >
        <PosterCanvas
          ref={ref}
          posterData={posterData}
          template={template}
        />
      </div>
    );
  }
);

HiddenPoster.displayName = "HiddenPoster";

export default HiddenPoster;