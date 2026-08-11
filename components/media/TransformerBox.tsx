"use client";

import { Transformer } from "react-konva";

type Props = {
  transformerRef: any;
};

export default function TransformerBox({
  transformerRef,
}: Props) {
  return (
    <Transformer
      ref={transformerRef}
      rotateEnabled={true}
      enabledAnchors={[
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ]}
    />
  );
}