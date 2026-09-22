"use client";

import {
  Stage,
  Layer,
  Group,
  Image as KonvaImage,
  Text,
  Rect,
} from "react-konva";
import { forwardRef, useEffect, useState } from "react";
import type Konva from "konva";
import useImage from "use-image";

type Winner = {
  studentName: string;
  team: string;
  photo: string;
  position: 1 | 2 | 3;
};

type PosterData = {
  studentName: string;
  programme: string;
  category: string;
  team: string;
  photo: string;
  winners: Winner[];
};

type Props = {
  posterData: PosterData;
  template: string;
};

const WIDTH = 900;
const HEIGHT = 1200;

/*
 * FIXED PHOTO WINDOWS
 *
 * These are part of the fixed poster layout.
 * The badge/background/card never moves.
 */
const SLOTS = {
  1: {
    x: 118,
    y: 550,
    width: 214,
    height: 314,
  },
  2: {
    x: 344,
    y: 550,
    width: 213,
    height: 315,
  },
  3: {
    x: 572,
    y: 550,
    width: 210,
    height: 315,
  },
};
function TemplateImage() {
  const [image] = useImage(
    "/media/posters/winner-template.png"
  );

  if (!image) return null;

  return (
    <KonvaImage
      image={image}
      x={0}
      y={0}
      width={WIDTH}
      height={HEIGHT}
      listening={false}
      draggable={false}
    />
  );
}
function WinnerBadge({
  position,
  x,
  y,
  width,
  height,
}: {
  position: 1 | 2 | 3;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const imagePath =
    position === 1
      ? "/media/posters/ribbon-1st.png"
      : position === 2
      ? "/media/posters/ribbon-2nd.png"
      : "/media/posters/ribbon-3rd.png";

  const [image] = useImage(imagePath);

  if (!image) return null;

  return (
    <KonvaImage
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      
      onDragStart={(e) => {
        e.cancelBubble = true;
      }}
      onDragEnd={(e) => {
        console.log(
          `Position ${position} badge:`,
          e.target.x(),
          e.target.y()
        );
      }}
    />
  );
}

function WinnerPhoto({
  winner,
  position,
  transform,
  setTransform,
}: {
  winner: Winner;
  position: 1 | 2 | 3;
  transform: {
    x: number;
    y: number;
    scale: number;
  };
  setTransform: (
    position: 1 | 2 | 3,
    value: {
      x: number;
      y: number;
      scale: number;
    }
  ) => void;
}) {
  const [image] = useImage(
    winner.photo || "/media/logos/munafasa-logo.png",
    "anonymous"
  );

  const slot = SLOTS[position];

  if (!image) return null;

  /*
   * Calculate a proper "cover" size.
   * This keeps the student's photo proportional.
   */
 

 const CARD_PADDING = 10;

const innerWidth =
  slot.width - CARD_PADDING * 2;

const innerHeight =
  slot.height - CARD_PADDING * 2;

const coverScale =
  Math.max(
    slot.width / image.width,
    slot.height / image.height
  ) * 1.12;

const photoWidth =
  image.width *
  coverScale *
  transform.scale;

const photoHeight =
  image.height *
  coverScale *
  transform.scale;

const defaultX =
  (slot.width - photoWidth) / 2;

const defaultY = -0;

const minX =
  slot.width - photoWidth;

const maxX = 0;

const minY =
  slot.height - photoHeight;

const maxY = 0;



  const finalX = Math.max(
    minX,
    Math.min(
      maxX,
      defaultX + transform.x
    )
  );

  const finalY = Math.max(
    minY,
    Math.min(
      maxY,
      defaultY + transform.y
    )
  );

  return (
    /*
     * THIS GROUP IS FIXED.
     *
     * It clips the photo to the card.
     * It is NOT draggable.
     */
   <Group
  x={slot.x}
  y={slot.y}
 clipFunc={(ctx) => {
  const radius = 22;

  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(slot.width - radius, 0);
  ctx.quadraticCurveTo(
    slot.width,
    0,
    slot.width,
    radius
  );
  ctx.lineTo(
    slot.width,
    slot.height - radius
  );
  ctx.quadraticCurveTo(
    slot.width,
    slot.height,
    slot.width - radius,
    slot.height
  );
  ctx.lineTo(radius, slot.height);
  ctx.quadraticCurveTo(
    0,
    slot.height,
    0,
    slot.height - radius
  );
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(
    0,
    0,
    radius,
    0
  );
  ctx.closePath();
}}
  listening={true}

>
  
      <KonvaImage
        image={image}
        x={finalX}
        y={finalY}
        width={photoWidth}
        height={photoHeight}
        draggable={true}
        cornerRadius={20}

        /*
         * Only the photo receives the event.
         */
        onMouseDown={(event) => {
          event.cancelBubble = true;
        }}

        onTouchStart={(event) => {
          event.cancelBubble = true;
        }}

        onDragStart={(event) => {
          event.cancelBubble = true;
        }}

        onDragMove={(event) => {
          event.cancelBubble = true;

          const node = event.target;

          const limitedX = Math.max(
            minX,
            Math.min(maxX, node.x())
          );

          const limitedY = Math.max(
            minY,
            Math.min(maxY, node.y())
          );

          node.x(limitedX);
          node.y(limitedY);
        }}

        onDragEnd={(event) => {
          event.cancelBubble = true;

          const node = event.target;

          const limitedX = Math.max(
            minX,
            Math.min(maxX, node.x())
          );

          const limitedY = Math.max(
            minY,
            Math.min(maxY, node.y())
          );

          node.x(limitedX);
          node.y(limitedY);

          setTransform(position, {
            x: limitedX - defaultX,
            y: limitedY - defaultY,
            scale: transform.scale,
          });
        }}

        /*
         * Mouse wheel = ZOOM PHOTO ONLY
         */
        onWheel={(event) => {
          event.cancelBubble = true;

          event.evt.preventDefault();

          const direction =
            event.evt.deltaY > 0
              ? -1
              : 1;

          const zoomStep = 0.05;

          let newScale =
            transform.scale +
            direction * zoomStep;

          /*
           * 1.0 = normal size
           * 2.2 = maximum zoom
           */
          newScale = Math.max(
            1,
            Math.min(2.2, newScale)
          );

          const newWidth =
            image.width *
            coverScale *
            newScale;

          const newHeight =
            image.height *
            coverScale *
            newScale;

          const newDefaultX =
            (slot.width - newWidth) / 2;

          const newDefaultY =
            (slot.height - newHeight) / 2;

          const newMinX =
            slot.width - newWidth;

          const newMaxX = 0;

          const newMinY =
            slot.height - newHeight;

          const newMaxY = 0;

          /*
           * Keep approximately the same
           * visible position after zoom.
           */
          const currentX =
            newDefaultX + transform.x;

          const currentY =
            newDefaultY + transform.y;

          const limitedX = Math.max(
            newMinX,
            Math.min(
              newMaxX,
              currentX
            )
          );

          const limitedY = Math.max(
            newMinY,
            Math.min(
              newMaxY,
              currentY
            )
          );

          setTransform(position, {
            x:
              limitedX -
              newDefaultX,
            y:
              limitedY -
              newDefaultY,
            scale: newScale,
          });
        }}
      />
    </Group>
  );
}

function WinnerInfo({
  winner,
  position,
}: {
  winner: Winner;
  position: 1 | 2 | 3;
}) {
  const slot = SLOTS[position];

  return (
    <>
      {/* FIXED STUDENT NAME */}
      <Text
        text={winner.studentName.toUpperCase()}
        x={slot.x}
        y={870}
        width={slot.width}
        height={36}
        align="center"
        verticalAlign="middle"
        fontSize={16}
        fontStyle="bold"
        fill="#FFFFFF"
        ellipsis
        listening={false}
      />

      {/* FIXED TEAM */}
      <Text
        text={winner.team.toUpperCase()}
        x={slot.x}
        y={925}
        width={slot.width}
        height={26}
        align="center"
        verticalAlign="middle"
        fontSize={20}
        fontStyle="bold"
        fill="#FFD900"
        ellipsis
        listening={false}
      />
    </>
  );
}

const PosterCanvas = forwardRef<Konva.Stage, Props>(
  ({ posterData }, ref) => {
    const first =
      posterData.winners.find(
        (winner) =>
          winner.position === 1
      );

    const second =
      posterData.winners.find(
        (winner) =>
          winner.position === 2
      );

    const third =
      posterData.winners.find(
        (winner) =>
          winner.position === 3
      );

    /*
     * Each photo has its own position
     * and zoom level.
     */
    const [
      photoTransforms,
      setPhotoTransforms,
    ] = useState({
      1: {
        x: 0,
        y: 0,
        scale: 1,
      },
      2: {
        x: 0,
        y: 0,
        scale: 1,
      },
      3: {
        x: 0,
        y: 0,
        scale: 1,
      },
    });

    useEffect(() => {
      setPhotoTransforms({
        1: {
          x: 0,
          y: 0,
          scale: 1,
        },
        2: {
          x: 0,
          y: 0,
          scale: 1,
        },
        3: {
          x: 0,
          y: 0,
          scale: 1,
        },
      });
    }, [
      posterData.programme,
      posterData.category,
      first?.studentName,
      second?.studentName,
      third?.studentName,
    ]);

    function updateTransform(
      position: 1 | 2 | 3,
      value: {
        x: number;
        y: number;
        scale: number;
      }
    ) {
      setPhotoTransforms(
        (current) => ({
          ...current,
          [position]: value,
        })
      );
    }

    return (
      <Stage
        ref={ref}
        width={WIDTH}
        height={HEIGHT}
        pixelRatio={3}

        /*
         * THE STAGE IS NEVER DRAGGABLE.
         */
        draggable={false}

        onDragStart={(event) => {
          event.target.stopDrag();
        }}
      >
        <Layer
          draggable={false}
        >
          {/* ================================================= */}
          {/* FIXED TEMPLATE */}
          {/* ================================================= */}

          
{/* BACKGROUND */}

<TemplateImage />

{/* PROGRAMME NAME */}
<Text
  text={posterData.programme.toUpperCase()}
  x={80}
  y={380}
  width={740}
  height={45}
  align="center"
  verticalAlign="middle"
  fontSize={34}
  fontStyle="bold"
  fill="#530808"
  ellipsis
  listening={false}
/>

{/* CATEGORY */}
<Text
  text={posterData.category.toUpperCase()}
  x={80}
  y={425}
  width={740}
  height={38}
  align="center"
  verticalAlign="middle"
  fontSize={26}
  fontStyle="bold"
  fill="#530808"
  ellipsis
  listening={false}
/>
{/* PHOTOS - DRAG + ZOOM */}
{first && (
  <WinnerPhoto
    winner={first}
    position={1}
    transform={photoTransforms[1]}
    setTransform={updateTransform}
  />
)}

{second && (
  <WinnerPhoto
    winner={second}
    position={2}
    transform={photoTransforms[2]}
    setTransform={updateTransform}
  />
)}

{third && (
  <WinnerPhoto
    winner={third}
    position={3}
    transform={photoTransforms[3]}
    setTransform={updateTransform}
  />
)}



{/* NAMES + TEAMS */}
{first && (
  <WinnerInfo
    winner={first}
    position={1}
  />
)}

{second && (
  <WinnerInfo
    winner={second}
    position={2}
  />
)}

{third && (
  <WinnerInfo
    winner={third}
    position={3}
  />
)}

        </Layer>

       {/* MEDALS + RIBBONS — FIXED POSITIONS */}
<Layer listening={false}>
  <WinnerBadge
    position={1}
    x={83}
    y={526}
    width={105}
    height={149}
  />

  <WinnerBadge
    position={2}
    x={316}
    y={526}
    width={105}
    height={149}
  />

  <WinnerBadge
    position={3}
    x={545}
    y={519}
    width={105}
    height={149}
  />
</Layer>

      </Stage>
    );
  }
);

PosterCanvas.displayName = "PosterCanvas";

export default PosterCanvas;