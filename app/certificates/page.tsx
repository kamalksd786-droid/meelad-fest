"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";

type Result = {
  id: number;
  programme_id: number;
  programme_name: string;
  category: string | null;
  admission_no: string | null;
  student_name: string;
  team: string;
  position: string;
  published: boolean;
  group_result_id: string | null;
};

type CertificateGroup = {
  key: string;
  programme_id: number;
  programme_name: string;
  category: string | null;
  position: string;
  team: string;
  students: Result[];
};

export default function CertificatesPage() {
  const [groups, setGroups] = useState<CertificateGroup[]>([]);
  const [selected, setSelected] =
    useState<CertificateGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    setLoading(true);

    const { data, error } = await supabase
      .from("results")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
      return;
    }

    const results: Result[] = data || [];

    const groupMap = new Map<string, Result[]>();

    results.forEach((result) => {
      const key =
        result.group_result_id ||
        "individual-" + result.id;

      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }

      groupMap.get(key)!.push(result);
    });

    const certificateGroups: CertificateGroup[] = [];

    groupMap.forEach((students, key) => {
      const first = students[0];

      certificateGroups.push({
        key: key,
        programme_id: first.programme_id,
        programme_name: first.programme_name,
        category: first.category,
        position: first.position,
        team: first.team,
        students: students,
      });
    });

    setGroups(certificateGroups);
    setLoading(false);
  }

  function positionText(position: string) {
    if (position === "First") return "FIRST";
    if (position === "Second") return "SECOND";
    if (position === "Third") return "THIRD";
    return position.toUpperCase();
  }

  return (
    <DashboardLayout>
      <div className="print:hidden">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              Certificates
            </h1>

            <p className="text-gray-500 mt-2">
              Generate certificates from published results.
            </p>
          </div>

          {selected && (
            <button
              onClick={() => window.print()}
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-bold"
            >
              Print Certificate
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-10 text-center">
            Loading certificates...
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold mb-5">
                Published Results
              </h2>

              <div className="space-y-3 max-h-[700px] overflow-y-auto">

                {groups.length === 0 ? (
                  <p className="text-gray-500">
                    No published results available.
                  </p>
                ) : (
                  groups.map((group) => (
                    <button
                      key={group.key}
                      onClick={() => setSelected(group)}
                      className={`w-full text-left rounded-xl p-4 border ${
                        selected?.key === group.key
                          ? "bg-green-100 border-green-600"
                          : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                      }`}
                    >
                      <div className="font-bold">
                        Programme ID: {group.programme_id}
                      </div>

                      <div className="font-bold mt-2">
                        {group.programme_name}
                      </div>

                      {group.category && (
                        <div className="text-sm text-gray-500 mt-1">
                          Category: {group.category}
                        </div>
                      )}

                      <div className="text-sm font-semibold mt-1">
                        Team: {group.team}
                      </div>

                      <div className="text-sm text-gray-500 mt-2">
                        Position: {group.position}
                      </div>

                      <div className="text-sm text-gray-500 mt-1">
                        Students: {group.students.length}
                      </div>
                    </button>
                  ))
                )}

              </div>
            </div>

            <div className="lg:col-span-2">

              {!selected ? (
                <div className="bg-white rounded-xl shadow p-12 text-center">
                  <h2 className="text-2xl font-bold">
                    Select a Result
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Select a published result to preview the certificate.
                  </p>
                </div>
              ) : (

                <div className="w-full overflow-auto">

                  <div
                    className="certificate relative mx-auto w-full max-w-[1200px] aspect-[1.414/1] overflow-hidden shadow-2xl"
                    style={{
                      backgroundImage:
                        "url('/images/certificate/certificate-background.png')",
                      backgroundSize: "100% 100%",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >

                    <div className="absolute inset-0 flex flex-col items-center text-center px-[10%] py-[7%]">

                      <h1 className="text-[clamp(24px,4vw,60px)] font-extrabold text-green-950">
                        MUNAFASA 2026
                      </h1>

                      <p className="text-[clamp(10px,1.4vw,20px)] font-semibold tracking-[0.25em] text-green-900">
                        GLOBAL PUBLIC SCHOOL
                      </p>

                      <h2 className="text-[clamp(24px,4vw,55px)] font-serif font-bold text-yellow-700 mt-[4%]">
                        CERTIFICATE
                      </h2>

                      <p className="text-[clamp(10px,1.2vw,18px)] text-gray-700 mt-[2%]">
                        This certificate is proudly presented to
                      </p>

                      <div className="mt-[3%] w-full">

                        {selected.students.length === 1 ? (
                          <>
                            <div className="text-[clamp(22px,3.5vw,52px)] font-bold text-green-950">
                              {selected.students[0].student_name}
                            </div>

                            {selected.students[0].admission_no && (
                              <div className="text-[clamp(9px,1vw,15px)] text-gray-600 mt-1">
                                Admission No:{" "}
                                {selected.students[0].admission_no}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="text-[clamp(11px,1.3vw,19px)] font-bold text-green-900">
                              GROUP PARTICIPANTS
                            </div>

                            <div className="mt-2 space-y-1">
                              {selected.students.map(
                                (student, index) => (
                                  <div
                                    key={student.id}
                                    className="text-[clamp(12px,1.6vw,24px)] font-bold text-green-950"
                                  >
                                    {index + 1}.{" "}
                                    {student.student_name}
                                  </div>
                                )
                              )}
                            </div>
                          </>
                        )}

                      </div>

                      <div className="mt-[3%]">

                        <p className="text-[clamp(10px,1.1vw,17px)] text-gray-700">
                          for securing
                        </p>

                        <div className="text-[clamp(17px,2.4vw,36px)] font-extrabold text-green-950 mt-1">
                          {positionText(selected.position)} PLACE
                        </div>

                      </div>

                      <div className="mt-[2%]">

                        <div className="text-[clamp(15px,2vw,29px)] font-bold text-green-950">
                          {selected.programme_name}
                        </div>

                        <div className="text-[clamp(9px,1vw,16px)] text-gray-700 mt-1">
                          Programme ID: {selected.programme_id}
                        </div>

                        {selected.category && (
                          <div className="text-[clamp(9px,1vw,16px)] text-gray-700">
                            Category: {selected.category}
                          </div>
                        )}

                        <div className="text-[clamp(10px,1.2vw,18px)] font-bold text-green-900 mt-1">
                          Team: {selected.team}
                        </div>

                      </div>

                      <div className="absolute bottom-[8%] left-[12%] right-[12%] flex justify-between text-center">

                        <div>
                          <div className="border-t border-green-950 w-[clamp(90px,12vw,180px)] pt-1 text-[clamp(8px,1vw,15px)] font-semibold">
                            Principal
                          </div>
                        </div>

                        <div>
                          <div className="border-t border-green-950 w-[clamp(90px,12vw,180px)] pt-1 text-[clamp(8px,1vw,15px)] font-semibold">
                            Coordinator
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {selected && (
        <div className="hidden print:block">

          <div
            className="certificate-print relative w-[297mm] h-[210mm] overflow-hidden"
            style={{
              backgroundImage:
                "url('/images/certificate/certificate-background.png')",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >

            <div className="absolute inset-0 flex flex-col items-center text-center px-[10%] py-[7%]">

              <h1 className="text-[52px] font-extrabold text-green-950">
                MUNAFASA 2026
              </h1>

              <p className="text-[18px] font-semibold tracking-[0.25em] text-green-900">
                GLOBAL PUBLIC SCHOOL
              </p>

              <h2 className="text-[52px] font-serif font-bold text-yellow-700 mt-8">
                CERTIFICATE
              </h2>

              <p className="text-[18px] text-gray-700 mt-5">
                This certificate is proudly presented to
              </p>

              <div className="mt-6">

                {selected.students.length === 1 ? (
                  <>
                    <div className="text-[48px] font-bold text-green-950">
                      {selected.students[0].student_name}
                    </div>

                    {selected.students[0].admission_no && (
                      <div className="text-[15px] text-gray-600">
                        Admission No:{" "}
                        {selected.students[0].admission_no}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-[18px] font-bold text-green-900">
                      GROUP PARTICIPANTS
                    </div>

                    <div className="mt-2">
                      {selected.students.map(
                        (student, index) => (
                          <div
                            key={student.id}
                            className="text-[25px] font-bold text-green-950"
                          >
                            {index + 1}.{" "}
                            {student.student_name}
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}

              </div>

              <div className="mt-7">
                <div className="text-[18px]">
                  for securing
                </div>

                <div className="text-[36px] font-extrabold text-green-950 mt-2">
                  {positionText(selected.position)} PLACE
                </div>
              </div>

              <div className="mt-5">

                <div className="text-[28px] font-bold text-green-950">
                  {selected.programme_name}
                </div>

                <div className="text-[16px] mt-1">
                  Programme ID: {selected.programme_id}
                </div>

                {selected.category && (
                  <div className="text-[16px]">
                    Category: {selected.category}
                  </div>
                )}

                <div className="text-[19px] font-bold text-green-900 mt-1">
                  Team: {selected.team}
                </div>

              </div>

              <div className="absolute bottom-[8%] left-[12%] right-[12%] flex justify-between text-center">

                <div>
                  <div className="border-t border-green-950 w-[180px] pt-1 text-[15px] font-semibold">
                    Principal
                  </div>
                </div>

                <div>
                  <div className="border-t border-green-950 w-[180px] pt-1 text-[15px] font-semibold">
                    Coordinator
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            width: 297mm;
            height: 210mm;
            overflow: hidden !important;
          }

          body * {
            visibility: hidden;
          }

          .certificate-print,
          .certificate-print * {
            visibility: visible;
          }

          .certificate-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
      `}</style>

    </DashboardLayout>
  );
}