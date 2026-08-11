import type Konva from "konva";

export async function capturePoster(
  stage: Konva.Stage
): Promise<Blob> {

  const dataURL = stage.toDataURL({
    pixelRatio: 3,
  });

  const response = await fetch(dataURL);

  return await response.blob();
}