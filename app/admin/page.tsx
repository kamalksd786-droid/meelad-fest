"use client";

import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f6f5",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#004d2b",
          color: "white",
          padding: "30px",
          borderRadius: "12px",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "32px" }}>MUNAFASA 2026</h1>

        <p style={{ marginTop: "8px", fontSize: "18px" }}>
          Admin Dashboard
        </p>

        <p style={{ marginBottom: 0 }}>
          Welcome to the MUNAFASA Administrator Dashboard.
        </p>
      </div>

      {/* Dashboard Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Students */}
        <button
          onClick={() => router.push("/students")}
          style={cardStyle("#2563eb")}
        >
          👨‍🎓
          <span style={titleStyle}>Students</span>
          <span style={descriptionStyle}>
            Manage registered students
          </span>
        </button>

        {/* Teachers */}
        <button
          onClick={() => router.push("/teachers")}
          style={cardStyle("#059669")}
        >
          👩‍🏫
          <span style={titleStyle}>Teachers</span>
          <span style={descriptionStyle}>
            Manage teacher assignments
          </span>
        </button>

        {/* Programmes */}
        <button
          onClick={() => router.push("/programmes")}
          style={cardStyle("#f59e0b")}
        >
          📋
          <span style={titleStyle}>Programmes</span>
          <span style={descriptionStyle}>
            View and manage programmes
          </span>
        </button>

        {/* Judge Sheets */}
        <button
          onClick={() => router.push("/score-entry")}
          style={cardStyle("#7c3aed")}
        >
          📝
          <span style={titleStyle}>Judge Sheets</span>
          <span style={descriptionStyle}>
            Select programme and print judge sheets
          </span>
        </button>

        {/* Marks & Results */}
        <button
          onClick={() => router.push("/score-entry")}
          style={cardStyle("#dc2626")}
        >
          🏆
          <span style={titleStyle}>Marks & Results</span>
          <span style={descriptionStyle}>
            Enter marks and manage results
          </span>
        </button>

        {/* Programme Assignment Report */}
        <button
          onClick={() => router.push("/programme-assignment-report")}
          style={cardStyle("#0891b2")}
        >
          📊
          <span style={titleStyle}>Assignment Report</span>
          <span style={descriptionStyle}>
            View programme-wise team assignments
          </span>
        </button>

        {/* Reports */}
        <button
          onClick={() => router.push("/reports")}
          style={cardStyle("#475569")}
        >
          📑
          <span style={titleStyle}>Reports</span>
          <span style={descriptionStyle}>
            View event reports
          </span>
        </button>
      </div>
    </main>
  );
}

/* Card styling */
function cardStyle(background: string) {
  return {
    background,
    color: "white",
    border: "none",
    borderRadius: "14px",
    padding: "28px 20px",
    minHeight: "170px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontSize: "38px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  };
}

const titleStyle = {
  fontSize: "22px",
  fontWeight: "bold",
};

const descriptionStyle = {
  fontSize: "14px",
  textAlign: "center" as const,
  opacity: 0.9,
};