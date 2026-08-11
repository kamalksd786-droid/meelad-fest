"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import StudentSearch from "./StudentSearch";
import ProgrammeSection from "./ProgrammeSection";
import RegistrationHistory from "./RegistrationHistory";

export default function TeacherRegisterPage() {

  const [teacherId, setTeacherId] = useState("");
  const [teacherName, setTeacherName] = useState("");

  const [student, setStudent] = useState<any>(null);

  const [registrations, setRegistrations] = useState<any[]>([]);

  useEffect(() => {

    const id = localStorage.getItem("teacherId");
    const name = localStorage.getItem("teacherName");

    if (!id) {
      window.location.href = "/teacher-login";
      return;
    }

    setTeacherId(id);
    setTeacherName(name || "");

    loadRegistrations(id);

  }, []);

  async function loadRegistrations(id: string = teacherId) {

    if (!id) return;

    const { data } = await supabase
      .from("registrations")
      .select("*")
      .eq("teacher_id", id)
      .order("id", { ascending: false });

    setRegistrations(data || []);

  }

  function logout() {

    localStorage.removeItem("teacherId");
    localStorage.removeItem("teacherName");

    window.location.href="/teacher-login";

  }

  return (

<div className="min-h-screen bg-gray-100">

<div className="bg-green-700 text-white shadow">

<div className="max-w-7xl mx-auto flex justify-between items-center p-6">

<div>

<h1 className="text-4xl font-bold">
MUNAFASA 2026
</h1>

<p>
Teacher Registration Portal
</p>

</div>

<div>

<h2 className="text-xl">
Welcome,
<b> {teacherName}</b>
</h2>

<button

onClick={logout}

className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded mt-2"

>

Logout

</button>

</div>

</div>

</div>

<div className="max-w-7xl mx-auto p-8">

<StudentSearch

onStudentFound={setStudent}

/>

<ProgrammeSection

student={student}

teacherId={teacherId}

onRegistered={() => loadRegistrations()}

/>

<div className="mt-10">

<RegistrationHistory

teacherId={teacherId}

registrations={registrations}

refresh={() => loadRegistrations()}

/>

</div>

</div>

</div>

  );

}