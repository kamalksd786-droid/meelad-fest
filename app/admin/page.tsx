export default function AdminDashboard() {
  return (
    <main style={{ padding: "40px" }}>
      <h1>MUNAFASA 2026</h1>
      <h2>Admin Dashboard</h2>

      <p>Welcome to the MUNAFASA Administrator Dashboard.</p>

      <div style={{ marginTop: "30px" }}>
        <button>Students</button>
        <button>Teachers</button>
        <button>Programmes</button>
        <button>Marks & Results</button>
        <button>Reports</button>
      </div>
    </main>
  );
}