"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function StudentPhotoManager() {
  const [admissionNo, setAdmissionNo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function uploadPhoto() {
    if (!file || !admissionNo) {
      alert("Please enter Admission Number and choose a photo.");
      return;
    }

    setLoading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${admissionNo}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("student-photos")
      .upload(fileName, file, {
        upsert: true,
      });

    if (uploadError) {
      alert(uploadError.message);
      setLoading(false);
      return;
    }

    const { data } = supabase.storage
      .from("student-photos")
      .getPublicUrl(fileName);

    const photoUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from("students")
      .update({ photo_url: photoUrl })
      .eq("admission_no", admissionNo);

    setLoading(false);

    if (updateError) {
      alert(updateError.message);
      return;
    }

    alert("Photo uploaded successfully!");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8">
        📸 Student Photo Manager
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl">

        <input
          className="w-full border rounded-lg p-3 mb-4"
          placeholder="Admission Number"
          value={admissionNo}
          onChange={(e) => setAdmissionNo(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
          className="mb-6"
        />

        <button
          onClick={uploadPhoto}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-lg"
        >
          {loading ? "Uploading..." : "Upload Photo"}
        </button>

      </div>
    </main>
  );
}
