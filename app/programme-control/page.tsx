"use client";

import DashboardLayout from "../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Programme = {
  id: number;
  programme_name: string;
  category: string | null;
};

type Stage = {
  id: number;
  stage_name: string;
};

type Schedule = {
  id: number;
  programme_id: number;
  stage_id: number;
  programme_date: string;
  start_time: string;
  end_time: string;
  status: string;
};

export default function ProgrammeControlPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedStage, setSelectedStage] = useState("");

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /*
  ============================================================
  LOAD DATA
  ============================================================
  */

  async function loadData() {
    const { data: programmeData, error: programmeError } =
      await supabase
        .from("programmes")
        .select("id, programme_name, category")
        .order("id");

    if (programmeError) {
      console.error(programmeError);
    }

    const { data: stageData, error: stageError } =
      await supabase
        .from("stages")
        .select("id, stage_name")
        .order("id");

    if (stageError) {
      console.error(stageError);
    }

    const { data: scheduleData, error: scheduleError } =
      await supabase
        .from("schedule")
        .select("*")
        .order("programme_date")
        .order("start_time");

    if (scheduleError) {
      console.error(scheduleError);
      return;
    }

    setProgrammes(programmeData || []);
    setStages(stageData || []);
    setSchedules(scheduleData || []);
  }

  /*
  ============================================================
  PROGRAMME
  ============================================================
  */

  function getProgramme(id: number) {
    return programmes.find(
      (programme) => programme.id === id
    );
  }

  /*
  ============================================================
  CURRENT PROGRAMME
  ============================================================
  */

  function getCurrent(stageId: number) {
    return schedules.find(
      (schedule) =>
        schedule.stage_id === stageId &&
        schedule.status === "Running"
    );
  }

  /*
  ============================================================
  NEXT PROGRAMME
  ============================================================
  */

  function getNext(stageId: number) {
    const now = new Date();

    const today =
      `${now.getFullYear()}-` +
      `${String(now.getMonth() + 1).padStart(2, "0")}-` +
      `${String(now.getDate()).padStart(2, "0")}`;

    const currentTime =
      `${String(now.getHours()).padStart(2, "0")}:` +
      `${String(now.getMinutes()).padStart(2, "0")}`;

    const upcoming = schedules
      .filter((schedule) => {
        if (schedule.stage_id !== stageId) {
          return false;
        }

        if (schedule.status !== "Scheduled") {
          return false;
        }

        if (schedule.programme_date > today) {
          return true;
        }

        if (
          schedule.programme_date === today &&
          schedule.start_time > currentTime
        ) {
          return true;
        }

        return false;
      })
      .sort((a, b) => {
        const aValue =
          `${a.programme_date} ${a.start_time}`;

        const bValue =
          `${b.programme_date} ${b.start_time}`;

        return aValue.localeCompare(bValue);
      });

    return upcoming[0];
  }

  /*
  ============================================================
  START PROGRAMME
  ============================================================
  */

  async function startProgramme(schedule: Schedule) {
    const programme = getProgramme(schedule.programme_id);

    const ok = confirm(
      `Start this programme?\n\n${
        programme?.programme_name || "Programme"
      }`
    );

    if (!ok) return;

    /*
      Stop any currently running programme
      on the same stage.
    */

    const { error: stopError } = await supabase
      .from("schedule")
      .update({
        status: "Completed",
      })
      .eq("stage_id", schedule.stage_id)
      .eq("status", "Running");

    if (stopError) {
      alert(stopError.message);
      return;
    }

    /*
      Start selected programme.
    */

    const { error } = await supabase
      .from("schedule")
      .update({
        status: "Running",
      })
      .eq("id", schedule.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();

    alert(
      `▶ ${programme?.programme_name || "Programme"} is now LIVE.`
    );
  }

  /*
  ============================================================
  PAUSE
  ============================================================
  */

  async function pauseProgramme(schedule: Schedule) {
    const { error } = await supabase
      .from("schedule")
      .update({
        status: "Paused",
      })
      .eq("id", schedule.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadData();
  }

  /*
  ============================================================
  RESUME
  ============================================================
  */

  async function resumeProgramme(schedule: Schedule) {
    const { error } = await supabase
      .from("schedule")
      .update({
        status: "Running",
      })
      .eq("id", schedule.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadData();
  }

  /*
  ============================================================
  STOP
  ============================================================
  */

  async function stopProgramme(schedule: Schedule) {
    const programme = getProgramme(schedule.programme_id);

    const ok = confirm(
      `Stop ${
        programme?.programme_name || "this programme"
      }?`
    );

    if (!ok) return;

    const { error } = await supabase
      .from("schedule")
      .update({
        status: "Completed",
      })
      .eq("id", schedule.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadData();
  }

  /*
  ============================================================
  DISPLAY
  ============================================================
  */

  return (
    <DashboardLayout>

      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          🎬 Programme Control
        </h1>

        <p className="text-gray-500 mt-2">
          Control the current and next programmes on all 5 stages.
        </p>

      </div>


      {/* STAGE FILTER */}

      <div className="bg-white rounded-xl shadow p-6 mb-8">

        <label className="font-bold block mb-2">
          Select Stage
        </label>

        <select
          value={selectedStage}
          onChange={(e) =>
            setSelectedStage(e.target.value)
          }
          className="border rounded-lg p-3 w-full md:w-1/2"
        >

          <option value="">
            All Stages
          </option>

          {stages.map((stage) => (
            <option
              key={stage.id}
              value={stage.id}
            >
              {stage.stage_name}
            </option>
          ))}

        </select>

      </div>


      {/* STAGE CARDS */}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

        {stages
          .filter(
            (stage) =>
              !selectedStage ||
              stage.id === Number(selectedStage)
          )
          .map((stage) => {

            const current = getCurrent(stage.id);
            const next = getNext(stage.id);

            const currentProgramme = current
              ? getProgramme(current.programme_id)
              : null;

            const nextProgramme = next
              ? getProgramme(next.programme_id)
              : null;

            return (
              <div
                key={stage.id}
                className="bg-white rounded-2xl shadow-lg p-6"
              >

                {/* STAGE */}

                <div className="flex justify-between items-center mb-5">

                  <h2 className="text-2xl font-bold">
                    🎤 {stage.stage_name}
                  </h2>

                  {current && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                      LIVE
                    </span>
                  )}

                </div>


                {/* CURRENT */}

                <div className="border rounded-xl p-4 mb-4">

                  <p className="text-sm text-gray-500 font-semibold mb-2">
                    CURRENT PROGRAMME
                  </p>

                  {current ? (

                    <>

                      <div className="text-xs text-gray-500">
                        Programme ID
                      </div>

                      <div className="font-bold text-blue-700">
                        {current.programme_id}
                      </div>

                      <p className="text-xl font-bold text-green-700 mt-2">
                        {currentProgramme?.programme_name ||
                          "Unknown Programme"}
                      </p>

                      {currentProgramme?.category && (
                        <p className="text-sm text-gray-500 mt-1">
                          Category:{" "}
                          {currentProgramme.category}
                        </p>
                      )}

                      <p className="text-sm mt-2">
                        ⏰ {current.start_time} -{" "}
                        {current.end_time}
                      </p>

                      <p className="text-sm mt-1 font-semibold">
                        Status: {current.status}
                      </p>

                      <div className="flex gap-2 mt-4">

                        <button
                          onClick={() =>
                            pauseProgramme(current)
                          }
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg font-semibold"
                        >
                          ⏸ Pause
                        </button>

                        <button
                          onClick={() =>
                            stopProgramme(current)
                          }
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold"
                        >
                          ⏹ Stop
                        </button>

                      </div>

                    </>

                  ) : (

                    <p className="text-gray-400">
                      No programme running
                    </p>

                  )}

                </div>


                {/* NEXT */}

                <div className="border rounded-xl p-4">

                  <p className="text-sm text-gray-500 font-semibold mb-2">
                    NEXT PROGRAMME
                  </p>

                  {next ? (

                    <>

                      <div className="text-xs text-gray-500">
                        Programme ID
                      </div>

                      <div className="font-bold text-blue-700">
                        {next.programme_id}
                      </div>

                      <p className="text-xl font-bold text-blue-700 mt-2">
                        {nextProgramme?.programme_name ||
                          "Unknown Programme"}
                      </p>

                      {nextProgramme?.category && (
                        <p className="text-sm text-gray-500 mt-1">
                          Category:{" "}
                          {nextProgramme.category}
                        </p>
                      )}

                      <p className="text-sm mt-2">
                        📅 {next.programme_date}
                      </p>

                      <p className="text-sm mt-1">
                        ⏰ {next.start_time} -{" "}
                        {next.end_time}
                      </p>

                      <p className="text-sm mt-1 font-semibold">
                        Status: {next.status}
                      </p>

                      <button
                        onClick={() =>
                          startProgramme(next)
                        }
                        className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-bold w-full"
                      >
                        ▶ Start Programme
                      </button>

                    </>

                  ) : (

                    <p className="text-gray-400">
                      No next programme
                    </p>

                  )}

                </div>


                {/* PAUSED PROGRAMME */}

                {!current &&
                  schedules.some(
                    (schedule) =>
                      schedule.stage_id === stage.id &&
                      schedule.status === "Paused"
                  ) && (

                    <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">

                      <p className="text-sm font-semibold text-orange-700">
                        ⏸ Programme Paused
                      </p>

                      {schedules
                        .filter(
                          (schedule) =>
                            schedule.stage_id ===
                              stage.id &&
                            schedule.status ===
                              "Paused"
                        )
                        .slice(0, 1)
                        .map((paused) => {

                          const programme =
                            getProgramme(
                              paused.programme_id
                            );

                          return (
                            <div key={paused.id}>

                              <p className="font-bold mt-1">
                                {programme?.programme_name}
                              </p>

                              <button
                                onClick={() =>
                                  resumeProgramme(
                                    paused
                                  )
                                }
                                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                              >
                                ▶ Resume
                              </button>

                            </div>
                          );
                        })}

                    </div>

                  )}

              </div>
            );
          })}

      </div>

    </DashboardLayout>
  );
}