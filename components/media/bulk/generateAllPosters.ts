import { bulkGenerator, BulkStudent } from "./bulkGenerator";
import { capturePoster } from "./capturePoster";
import { downloadZip } from "./downloadZip";
import type Konva from "konva";

type Props = {
  students: BulkStudent[];
  posterStage: Konva.Stage;
  updatePoster: (student: BulkStudent) => Promise<void>;
  onProgress?: (current: number, total: number) => void;
};

export async function generateAllPosters({
  students,
  posterStage,
  updatePoster,
  onProgress,
}: Props) {

  const zipBlob = await bulkGenerator(
    students,
    async (student) => {
      await updatePoster(student);
      return await capturePoster(posterStage);
    },
    onProgress
  );

  downloadZip(
    zipBlob,
    "MUNAFASA_PARTICIPATION_POSTERS.zip"
  );
}