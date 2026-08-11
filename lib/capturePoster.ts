import { toBlob } from "html-to-image";

export async function capturePoster(
  element: HTMLElement
): Promise<Blob> {
  const blob = await toBlob(element, {
    cacheBust: true,
    pixelRatio: 3,
    backgroundColor: "transparent",
  });

  if (!blob) {
    throw new Error("Failed to capture poster.");
  }

  return blob;
}