import JSZip from "jszip";
import { saveAs } from "file-saver";

export default class ZipExporter {
  private zip = new JSZip();

  addPoster(filename: string, dataUrl: string) {
    const base64 = dataUrl.split(",")[1];
    this.zip.file(filename, base64, { base64: true });
  }

  async download(zipName: string) {
    const blob = await this.zip.generateAsync({
      type: "blob",
    });

    saveAs(blob, zipName);
  }
}