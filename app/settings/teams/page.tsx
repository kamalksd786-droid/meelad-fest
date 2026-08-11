"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import BackButton from "@/app/components/layout/BackButton";
import { supabase } from "@/lib/supabase";

type Team = {
  id: number;
  team_name: string;
  team_code: string;
  team_color: string;
  status: string;
};

export default function TeamsPage() {

  const [teams, setTeams] = useState<Team[]>([]);

  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [teamColor, setTeamColor] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {

    const { data } = await supabase
      .from("teams")
      .select("*")
      .order("team_name");

    setTeams(data || []);

  }
  async function saveTeam() {

  if (!teamName || !teamCode || !teamColor) {
    alert("Please fill all fields.");
    return;
  }

  const { data: existing } = await supabase
    .from("teams")
    .select("id")
    .eq("team_code", teamCode);

  if (existing && existing.length > 0) {
    alert("Team Code already exists.");
    return;
  }

  const { error } = await supabase
    .from("teams")
    .insert({
      team_name: teamName,
      team_code: teamCode,
      team_color: teamColor,
      status: "Active",
    });

  if (error) {
    alert(error.message);
    return;
  }

  alert("✅ Team Added");

  setTeamName("");
  setTeamCode("");
  setTeamColor("");

  loadTeams();
}

async function deleteTeam(id: number) {

  if (!confirm("Delete this team?")) return;

  await supabase
    .from("teams")
    .delete()
    .eq("id", id);

  loadTeams();
}
return (
  <DashboardLayout>

    <BackButton />

    <div className="flex justify-between items-center mb-8">

      <div>

        <h1 className="text-4xl font-bold">
          👥 Team Management
        </h1>

        <p className="text-gray-500">
          Total Teams : {teams.length}
        </p>

      </div>

    </div>

    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

      <div className="grid md:grid-cols-3 gap-6">

        <input
          placeholder="Team Name"
          className="border rounded-lg p-3"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />

        <input
          placeholder="Team Code"
          className="border rounded-lg p-3"
          value={teamCode}
          onChange={(e) => setTeamCode(e.target.value)}
        />

        <select
          className="border rounded-lg p-3"
          value={teamColor}
          onChange={(e) => setTeamColor(e.target.value)}
        >
          <option value="">Select Team Color</option>
          <option value="Red">🔴 Red</option>
          <option value="Blue">🔵 Blue</option>
          <option value="Yellow">🟡 Yellow</option>
          <option value="Green">🟢 Green</option>
        </select>

      </div>

      <button
        onClick={saveTeam}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
      >
        ➕ Add Team
      </button>

    </div>

    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">

      <input
        type="text"
        placeholder="🔍 Search Team..."
        className="w-full border rounded-lg p-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

    </div>
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

      <table className="w-full">

        <thead className="bg-blue-900 text-white">

          <tr>
            <th className="p-4 text-left">Team</th>
            <th className="p-4 text-left">Code</th>
            <th className="p-4 text-left">Color</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-center">Actions</th>
          </tr>

        </thead>

        <tbody>

          {teams
            .filter((team) =>
              (
                team.team_name +
                team.team_code +
                team.team_color
              )
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((team) => (

              <tr
                key={team.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4 font-semibold">
                  {team.team_name}
                </td>

                <td className="p-4">
                  {team.team_code}
                </td>

                <td className="p-4">
                  {team.team_color}
                </td>

                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {team.status}
                  </span>
                </td>

                <td className="p-4 text-center">

                  <button
                    onClick={() => deleteTeam(team.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑 Delete
                  </button>

                </td>

              </tr>

            ))}

        </tbody>

      </table>

    </div>

  </DashboardLayout>
);
}