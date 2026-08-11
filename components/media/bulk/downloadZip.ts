import { saveAs } from "file-saver";

export function downloadZip(
  blob: Blob,
  fileName: string
) {
  saveAs(blob, fileName);
}