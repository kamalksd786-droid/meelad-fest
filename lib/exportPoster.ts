import html2canvas from "html2canvas";

export async function exportPoster(
  element: HTMLDivElement,
  fileName: string
) {
  const canvas = await html2canvas(element, {
    scale: 3,
    backgroundColor: null,
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create PNG"));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}