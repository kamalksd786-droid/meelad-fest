import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportCertificatePDF(
  element: HTMLElement,
  filename: string
) {
  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: null,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(
    imgData,
    "PNG",
    0,
    0,
    canvas.width,
    canvas.height
  );

  pdf.save(`${filename}.pdf`);
}