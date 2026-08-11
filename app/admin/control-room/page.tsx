"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type CurrentProgramme = {
  programme_code: string;
  programme_name: string;
  category: string;
  stage: string;
};

export default function ControlRoomPage() {
  const [programme, setProgramme] = useState<CurrentProgramme>({
    programme_code: "",
    programme_name: "",
    category: "",
    stage: "",
  });

  useEffect(() => {
    loadProgramme();
  }, []);

  async function loadProgramme() {
    const { data } = await supabase
      .from("current_programme")
      .select("*")
      .eq("id", 1)
      .single();

    if (data) {
      setProgramme(data);
    }
  }

  return (
    <div>

      <h1 className="text-4xl font-bold mb-8">
        🎛 Event Control Room
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-8">

        <h2 className="text-2xl font-bold mb-6">
          🎭 Current Programme
        </h2>

        <div className="space-y-4">

          <div>
            <strong>Code:</strong> {programme.programme_code || "-"}
          </div>

          <div>
            <strong>Programme:</strong> {programme.programme_name || "-"}
          </div>

          <div>
            <strong>Category:</strong> {programme.category || "-"}
          </div>

          <div>
            <strong>Stage:</strong> {programme.stage || "-"}
          </div>

        </div>

      </div>

    </div>
  );
}