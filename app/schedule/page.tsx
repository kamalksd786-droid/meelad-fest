"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import BackButton from "../components/layout/BackButton";
import { supabase } from "@/lib/supabase";

type Programme = {
  id: number;
  programme_name: string;
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

export default function SchedulePage() {

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [programmeId, setProgrammeId] = useState("");
  const [stageId, setStageId] = useState("");
  const [programmeDate, setProgrammeDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    const { data: programmeData } = await supabase
      .from("programmes")
      .select("id, programme_name")
      .order("programme_name");

    const { data: stageData } = await supabase
      .from("stages")
      .select("id, stage_name")
      .order("stage_name");

    const { data: scheduleData } = await supabase
      .from("schedule")
      .select("*")
      .order("programme_date");

    setProgrammes(programmeData || []);
    setStages(stageData || []);
    setSchedules(scheduleData || []);

  }
  async function saveSchedule() {

  if (
    !programmeId ||
    !stageId ||
    !programmeDate ||
    !startTime ||
    !endTime
  ) {
    alert("Please fill all fields.");
    return;
  }

  const { error } = await supabase
    .from("schedule")
    .insert({
      programme_id: Number(programmeId),
      stage_id: Number(stageId),
      programme_date: programmeDate,
      start_time: startTime,
      end_time: endTime,
      status: "Scheduled",
    });

  if (error) {
    alert(error.message);
    return;
  }

  alert("✅ Schedule Saved");

  setProgrammeId("");
  setStageId("");
  setProgrammeDate("");
  setStartTime("");
  setEndTime("");

  loadData();
}

async function deleteSchedule(id: number) {

  if (!confirm("Delete this schedule?")) return;

  await supabase
    .from("schedule")
    .delete()
    .eq("id", id);

  loadData();
}
return (
  <DashboardLayout>

    <BackButton />

    <div className="flex justify-between items-center mb-8">

      <div>

        <h1 className="text-4xl font-bold">
          📅 Programme Scheduling
        </h1>

        <p className="text-gray-500">
          Total Schedules : {schedules.length}
        </p>

      </div>

    </div>

    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        <select
          className="border rounded-lg p-3"
          value={programmeId}
          onChange={(e) => setProgrammeId(e.target.value)}
        >
          <option value="">Select Programme</option>

          {programmes.map((programme) => (
            <option
              key={programme.id}
              value={programme.id}
            >
              {programme.programme_name}
            </option>
          ))}

        </select>

        <select
          className="border rounded-lg p-3"
          value={stageId}
          onChange={(e) => setStageId(e.target.value)}
        >
          <option value="">Select Stage</option>

          {stages.map((stage) => (
            <option
              key={stage.id}
              value={stage.id}
            >
              {stage.stage_name}
            </option>
          ))}

        </select>

        <input
          type="date"
          className="border rounded-lg p-3"
          value={programmeDate}
          onChange={(e) => setProgrammeDate(e.target.value)}
        />

        <input
          type="time"
          className="border rounded-lg p-3"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <input
          type="time"
          className="border rounded-lg p-3"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

      </div>

      <button
        onClick={saveSchedule}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
      >
        💾 Save Schedule
      </button>

    </div>
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

      <table className="w-full">

        <thead className="bg-blue-900 text-white">

          <tr>
            <th className="p-4 text-left">Programme</th>
            <th className="p-4 text-left">Stage</th>
            <th className="p-4 text-left">Date</th>
            <th className="p-4 text-left">Time</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-center">Actions</th>
          </tr>

        </thead>

        <tbody>

          {schedules.map((schedule) => {

            const programme = programmes.find(
              (p) => p.id === schedule.programme_id
            );

            const stage = stages.find(
              (s) => s.id === schedule.stage_id
            );

            return (

              <tr
                key={schedule.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">
                  {programme?.programme_name || "-"}
                </td>

                <td className="p-4">
                  {stage?.stage_name || "-"}
                </td>

                <td className="p-4">
                  {schedule.programme_date}
                </td>

                <td className="p-4">
                  {schedule.start_time} - {schedule.end_time}
                </td>

                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {schedule.status}
                  </span>
                </td>

                <td className="p-4 text-center">

                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑 Delete
                  </button>

                </td>

              </tr>

            );

          })}

        </tbody>

      </table>

    </div>

  </DashboardLayout>
);
}