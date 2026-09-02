"use client";

type CertificateData = {
  studentName: string;
  admissionNo: string;
  programme: string;
  category: string;
  team: string;
  certificateNo: string;
  date: string;
  achievement: string;
};

type Props = {
  certificateData: CertificateData;
  setCertificateData: React.Dispatch<
    React.SetStateAction<CertificateData>
  >;
};

export default function CertificateRightPanel({
  certificateData,
  setCertificateData,
}: Props) {
  return (
    <div className="w-72 bg-white border-l p-5 overflow-y-auto">

      <h2 className="text-2xl font-bold mb-6">
        Certificate Details
      </h2>

      <div className="space-y-4">

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Student Name"
          value={certificateData.studentName}
          onChange={(e) =>
            setCertificateData((prev) => ({
              ...prev,
              studentName: e.target.value,
            }))
          }
        />

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Admission No."
          value={certificateData.admissionNo}
          onChange={(e) =>
            setCertificateData((prev) => ({
              ...prev,
              admissionNo: e.target.value,
            }))
          }
        />

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Programme"
          value={certificateData.programme}
          onChange={(e) =>
            setCertificateData((prev) => ({
              ...prev,
              programme: e.target.value,
            }))
          }
        />

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Category"
          value={certificateData.category}
          onChange={(e) =>
            setCertificateData((prev) => ({
              ...prev,
              category: e.target.value,
            }))
          }
        />

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Team"
          value={certificateData.team}
          onChange={(e) =>
            setCertificateData((prev) => ({
              ...prev,
              team: e.target.value,
            }))
          }
        />

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Achievement"
          value={certificateData.achievement}
          onChange={(e) =>
            setCertificateData((prev) => ({
              ...prev,
              achievement: e.target.value,
            }))
          }
        />

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Certificate No."
          value={certificateData.certificateNo}
          onChange={(e) =>
            setCertificateData((prev) => ({
              ...prev,
              certificateNo: e.target.value,
            }))
          }
        />

        <input
          type="date"
          className="w-full border rounded-lg p-2"
          value={certificateData.date}
          onChange={(e) =>
            setCertificateData((prev) => ({
              ...prev,
              date: e.target.value,
            }))
          }
        />

      </div>

    </div>
  );
}