import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function downloadZip(
  zip: JSZip,
  fileName: string
) {
  const blob = await zip.generateAsync({
    type: "blob",
  });

  saveAs(blob, fileName);
}