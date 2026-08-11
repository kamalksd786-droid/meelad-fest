import JSZip from "jszip";

export type BulkStudent = {
  student_name: string;
  admission_no: string;
  category: string;
  team: string;
  photo_url: string;
};

export async function bulkGenerator(
  students: BulkStudent[],
  generatePoster: (student: BulkStudent) => Promise<Blob>,
  onProgress?: (current: number, total: number) => void
) {
  const zip = new JSZip();

  for (let i = 0; i < students.length; i++) {
    const student = students[i];

    const blob = await generatePoster(student);

    zip.file(
      `${student.student_name}.png`,
      blob
    );

    onProgress?.(i + 1, students.length);
  }

  return await zip.generateAsync({
    type: "blob",
  });
}