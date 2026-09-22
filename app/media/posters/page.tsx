"use client";

import { useEffect, useRef, useState } from "react";
import type Konva from "konva";

import { supabase } from "@/lib/supabase";

import Toolbar from "@/components/media/Toolbar";
import LeftPanel from "@/components/media/LeftPanel";
import RightPanel from "@/components/media/RightPanel";
import PosterCanvas from "@/components/media/PosterCanvas";
import ProgrammeSelector from "@/components/media/ProgrammeSelector";

type Winner = {
  studentName: string;
  team: string;
  photo: string;
  position: 1 | 2 | 3;
};

type PosterData = {
  studentName: string;
  programme: string;
  category: string;
  team: string;
  photo: string;
  winners: Winner[];
};

export default function PosterDesigner() {
  const posterRef = useRef<HTMLDivElement>(null);
const stageRef = useRef<Konva.Stage>(null);
const shareFileRef = useRef<File | null>(null);

  const [selectedTemplate, setSelectedTemplate] =
    useState("winner");

  const [programmes, setProgrammes] = useState<any[]>([]);
  const [selectedProgramme, setSelectedProgramme] =
    useState("");

  const [loadingWinners, setLoadingWinners] =
    useState(false);

  const [posterData, setPosterData] =
    useState<PosterData>({
      studentName: "",
      programme: "",
      category: "",
      team: "",
      photo: "",
      winners: [],
    });

  useEffect(() => {
    loadProgrammes();
  }, []);

  async function loadProgrammes() {
    const { data, error } = await supabase
      .from("programmes")
      .select("*")
      .order("programme_name");

    if (error) {
      console.error("Programme loading error:", error);
      alert("Failed to load programmes.");
      return;
    }

    setProgrammes(data || []);
  }

  /*
   * IMPORTANT:
   *
   * Results are now loaded from the REAL "results" table.
   *
   * Result Entry:
   * Chest No -> Student -> Admission No
   *
   * Results Management:
   * published = true
   *
   * Poster:
   * results.admission_no
   *       ->
   * students.admission_no
   *       ->
   * students.photo_url
   */
  async function loadWinners(programmeId: string) {
    setSelectedProgramme(programmeId);

    const selected = programmes.find(
      (p) => String(p.id) === String(programmeId)
    );

    if (!selected) {
      return;
    }

    // Clear old poster immediately.
    // This prevents an old student such as KAMAL
    // from remaining on screen while loading a new programme.
    setPosterData({
      studentName: "",
      programme: selected.programme_name || "",
      category: selected.category || "",
      team: "",
      photo: "",
      winners: [],
    });

    setLoadingWinners(true);

    try {
      /*
       * STEP 1
       * Read the ACTUAL published results.
       *
       * We do NOT use published_results here.
       */
      const { data: results, error } = await supabase
        .from("results")
        .select(
          `
          programme_id,
          programme_name,
          category,
          admission_no,
          student_name,
          team,
          position,
          published
        `
        )
       .in("position", ["First", "Second", "Third"])

      if (error) {
        console.error("Published result loading error:", error);

        alert(
          "Failed to load published results.\n\n" +
          error.message
        );

        return;
      }

      console.log(
        "Published results for programme:",
        programmeId,
        results
      );

      if (!results || results.length === 0) {
        alert(
          `No published 1st, 2nd or 3rd place result found for Programme ${programmeId}.`
        );

        return;
      }

      /*
       * STEP 2
       * Get Admission Numbers from the published results.
       */
      const admissionNumbers = results
        .map((result) =>
          String(result.admission_no || "").trim()
        )
        .filter(Boolean);

      if (admissionNumbers.length === 0) {
        alert(
          "Published results were found, but no admission numbers were saved with them."
        );

        return;
      }

      console.log(
        "Admission numbers:",
        admissionNumbers
      );

      /*
       * STEP 3
       * Match Admission Number with students table.
       *
       * This is where the student's photo is obtained.
       */
      const { data: studentRows, error: studentError } =
        await supabase
          .from("students")
          .select(
            `
            admission_no,
            student_name,
            team,
            category,
            photo_url
          `
          )
          .in("admission_no", admissionNumbers);

      if (studentError) {
        console.error(
          "Student matching error:",
          studentError
        );

        alert(
          "Failed to match students with admission numbers.\n\n" +
          studentError.message
        );

        return;
      }

      console.log(
        "Matched student records:",
        studentRows
      );

      /*
       * STEP 4
       * Build the three winners.
       */
      const winners: Winner[] = [];

      for (const result of results) {
        const positionMap: Record<string, 1 | 2 | 3> = {
  First: 1,
  Second: 2,
  Third: 3,
};

const position =
  positionMap[String(result.position)];

if (!position) {
  continue;
}

        const resultAdmissionNo = String(
          result.admission_no || ""
        ).trim();

        const student = studentRows?.find(
          (student) =>
            String(student.admission_no || "").trim() ===
            resultAdmissionNo
        );

        if (!student) {
          console.warn(
            "Student not found for admission number:",
            resultAdmissionNo
          );

          winners.push({
            position: position as 1 | 2 | 3,
            studentName:
              result.student_name || "",
            team:
              result.team || "",
            photo: "",
          });

          continue;
        }

        winners.push({
          position: position as 1 | 2 | 3,

          studentName:
            student.student_name ||
            result.student_name ||
            "",

          team:
            student.team ||
            result.team ||
            "",

          photo:
            student.photo_url ||
            "",
        });
      }

      /*
       * Sort 1st -> 2nd -> 3rd.
       */
      winners.sort(
        (a, b) => a.position - b.position
      );

      console.log(
        "Final poster winners:",
        winners
      );

      /*
       * STEP 5
       * Put the real winners into the poster.
       */
      setPosterData({
        studentName:
          winners[0]?.studentName || "",

        programme:
          selected.programme_name || "",

        category:
          selected.category ||
          results[0]?.category ||
          "",

        team:
          winners[0]?.team || "",

        photo:
          winners[0]?.photo || "",

        winners,
      });
    } finally {
      setLoadingWinners(false);
    }
  }

  /*
   * Publish generated poster to Live Display.
   */
  useEffect(() => {
  if (!stageRef.current || posterData.winners.length === 0) {
    shareFileRef.current = null;
    return;
  }

  const prepareShareFile = async () => {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      const stage = stageRef.current;

      if (!stage) return;

      const dataUrl = stage.toDataURL({
        pixelRatio: 3,
        mimeType: "image/jpeg",
        quality: 0.95,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const fileName =
        `MUNAFASA-${posterData.programme
          .replace(/[^a-zA-Z0-9]/g, "-")}.jpg`;

      shareFileRef.current = new File(
        [blob],
        fileName,
        {
          type: "image/jpeg",
        }
      );

      console.log(
        "WhatsApp image prepared directly from Konva Stage."
      );
    } catch (error) {
      console.error(
        "Failed to prepare Konva poster image:",
        error
      );

      shareFileRef.current = null;
    }
  };

  prepareShareFile();
}, [posterData]);
  async function publishPosterToLiveDisplay(
    dataUrl: string,
    data: PosterData = posterData
  ) {
    try {
      const blob = await fetch(dataUrl).then(
        (response) => response.blob()
      );

      const safeName = (
        data.programme ||
        "winner-poster"
      )
        .replace(/[^a-zA-Z0-9_-]+/g, "_")
        .slice(0, 80);

      const filePath =
        `posters/${Date.now()}-${crypto.randomUUID()}-${safeName}.png`;

      const { error: uploadError } =
        await supabase.storage
          .from("live-posters")
          .upload(filePath, blob, {
            contentType: "image/png",
            cacheControl: "31536000",
            upsert: false,
          });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("live-posters")
          .getPublicUrl(filePath);

      const { error: insertError } =
        await supabase
          .from("live_display_posts")
          .insert({
            post_type: "poster",
            image_url: publicUrlData.publicUrl,

            student_name:
              data.winners
                .map((winner) => winner.studentName)
                .join(" / ") || null,

            programme_name:
              data.programme || null,

            category:
              data.category || null,

            team:
              data.winners
                .map((winner) => winner.team)
                .join(" / ") || null,
          });

      if (insertError) {
        throw insertError;
      }

      return true;
    } catch (error) {
      console.error(
        "Failed to publish poster to Live Display:",
        error
      );

      return false;
    }
  }

  /*
   * Download PNG + publish to Live Display.
   */
  async function exportPNG() {
  if (!stageRef.current) {
    alert("Poster not found.");
    return;
  }

  if (posterData.winners.length === 0) {
    alert(
      "Please select a programme with published winners."
    );
    return;
  }

  try {
    const stage = stageRef.current;

    const dataUrl = stage.toDataURL({
      pixelRatio: 3,
      mimeType: "image/png",
    });

    const link = document.createElement("a");

    link.download =
      `${posterData.programme || "MUNAFASA-WINNERS"}.png`;

    link.href = dataUrl;
    link.click();

    const published =
      await publishPosterToLiveDisplay(
        dataUrl,
        posterData
      );

    if (published) {
      alert(
        "Winner poster downloaded and published to Live Display."
      );
    } else {
      alert(
        "Poster downloaded, but Live Display publishing failed."
      );
    }
  } catch (error) {
    console.error(error);

    alert("Failed to export winner poster.");
  }
}
async function sharePoster() {
  if (!posterRef.current) {
    alert("Poster not found.");
    return;
  }

  if (posterData.winners.length === 0) {
    alert("Please select a programme with published winners.");
    return;
  }

  const file = shareFileRef.current;

  if (!file) {
    alert(
      "The poster image is still preparing. Please wait a moment and try again."
    );
    return;
  }

  try {
    // Native phone/tablet sharing
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({
        files: [file],
      })
    ) {
      await navigator.share({
        title: "MUNAFASA Winner",
        text: `${posterData.programme} — ${posterData.category}`,
        files: [file],
      });

      return;
    }

    // Windows / desktop fallback
    const url = URL.createObjectURL(file);

    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    alert(
      "JPG downloaded. Open WhatsApp and attach it using Photos & videos."
    );
  } catch (error) {
    console.error("WhatsApp sharing failed:", error);

    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      return;
    }

    alert("Could not share the winner poster.");
  }
}
  async function generateAllPosters() {
    alert(
      "Please select a programme first. Automatic winner poster generation will use the published results."
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">

      <Toolbar
        onSave={() =>
          alert("Save coming soon")
        }
        onExportPNG={exportPNG}
        onExportPDF={() =>
          alert("PDF Export coming soon")
        }
        onGenerateAll={
          generateAllPosters
        }
      />

      {loadingWinners && (
        <div className="bg-white border-b p-3 text-center font-semibold">
          Loading published winners and student photos...
        </div>
      )}

      <div className="flex flex-1">

        <LeftPanel
          selectedTemplate={
            selectedTemplate
          }
          setSelectedTemplate={
            setSelectedTemplate
          }
        />

        <div className="flex-1 flex flex-col p-4">

          <div className="mb-4">

            <ProgrammeSelector
              programmes={programmes}
              selected={selectedProgramme}
              onChange={loadWinners}
            />

          </div>

          <div className="flex flex-1 gap-4">

            <div className="flex-1 flex items-center justify-center bg-gray-200 rounded-xl p-4">

              <div
                ref={posterRef}
                className="flex items-center justify-center"
              >

                <PosterCanvas
  ref={stageRef}
  posterData={posterData}
  template={selectedTemplate}
/>

              </div>

            </div>

          </div>

          <div className="mt-4 flex justify-center gap-3">

            <button
              onClick={exportPNG}
              disabled={
                loadingWinners ||
                posterData.winners.length === 0
              }
              className="px-5 py-3 rounded-lg bg-black text-white font-semibold disabled:opacity-50"
            >
              Download Winner Poster
            </button>

            <button
              onClick={sharePoster}
              disabled={
                loadingWinners ||
                posterData.winners.length === 0
              }
              className="px-5 py-3 rounded-lg bg-green-600 text-white font-semibold disabled:opacity-50"
            >
              Share / WhatsApp
            </button>

          </div>

        </div>

        <RightPanel
          posterData={posterData}
          setPosterData={setPosterData}
        />

      </div>

    </div>
  );
}