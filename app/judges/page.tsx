"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import BackButton from "../components/layout/BackButton";
import { supabase } from "@/lib/supabase";

type Judge = {
  id: number;
  judge_name: string;
  mobile: string;
  username: string;
  password: string;
  status: string;
};

export default function JudgesPage() {

  const [judges, setJudges] = useState<Judge[]>([]);

  const [judgeName, setJudgeName] = useState("");
  const [mobile, setMobile] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    loadJudges();
  }, []);

  async function loadJudges() {

    const { data } = await supabase
      .from("judges")
      .select("*")
      .order("judge_name");

    setJudges(data || []);

  }
  async function saveJudge() {

  if (
    !judgeName ||
    !mobile ||
    !username ||
    !password
  ) {
    alert("Please fill all fields.");
    return;
  }

  // Check duplicate username

  const { data: existing } = await supabase
    .from("judges")
    .select("id")
    .eq("username", username);

  if (existing && existing.length > 0) {
    alert("Username already exists.");
    return;
  }

  const { error } = await supabase
    .from("judges")
    .insert({
      judge_name: judgeName,
      mobile,
      username,
      password,
      status: "Active",
    });

  if (error) {
    alert(error.message);
    return;
  }

  alert("✅ Judge Added");

  setJudgeName("");
  setMobile("");
  setUsername("");
  setPassword("");

  loadJudges();

}

async function deleteJudge(id: number) {

  if (!confirm("Delete this judge?")) return;

  await supabase
    .from("judges")
    .delete()
    .eq("id", id);

  loadJudges();

}
return (
  <DashboardLayout>

    <BackButton />

    <div className="flex justify-between items-center mb-8">

      <div>

        <h1 className="text-4xl font-bold">
          👨‍⚖️ Judges Management
        </h1>

        <p className="text-gray-500">
          Total Judges : {judges.length}
        </p>

      </div>

    </div>

    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

      <div className="grid md:grid-cols-2 gap-6">

        <input
          placeholder="Judge Name"
          className="border rounded-lg p-3"
          value={judgeName}
          onChange={(e) => setJudgeName(e.target.value)}
        />

        <input
          placeholder="Mobile Number"
          className="border rounded-lg p-3"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        <input
          placeholder="Username"
          className="border rounded-lg p-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border rounded-lg p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

      </div>

      <button
        onClick={saveJudge}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
      >
        ➕ Add Judge
      </button>

    </div>
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

      <table className="w-full">

        <thead className="bg-blue-900 text-white">

          <tr>
            <th className="p-4 text-left">Judge</th>
            <th className="p-4 text-left">Mobile</th>
            <th className="p-4 text-left">Username</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-center">Actions</th>
          </tr>

        </thead>

        <tbody>

          {judges.map((judge) => (

            <tr
              key={judge.id}
              className="border-b hover:bg-gray-50"
            >

              <td className="p-4">
                {judge.judge_name}
              </td>

              <td className="p-4">
                {judge.mobile}
              </td>

              <td className="p-4">
                {judge.username}
              </td>

              <td className="p-4">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  {judge.status}
                </span>
              </td>

              <td className="p-4 text-center">

                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => deleteJudge(judge.id)}
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