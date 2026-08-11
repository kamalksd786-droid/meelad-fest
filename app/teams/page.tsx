export default function TeamsPage() {
  return (
    <main className="min-h-screen bg-green-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-10">
        MUNAFASA 2026 Teams
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-red-600 p-8 rounded-xl text-3xl font-bold">
          DIJLA
        </div>

        <div className="bg-blue-600 p-8 rounded-xl text-3xl font-bold">
          FURATH
        </div>

        <div className="bg-yellow-400 text-black p-8 rounded-xl text-3xl font-bold">
          NILE
        </div>

        <div className="bg-green-600 p-8 rounded-xl text-3xl font-bold">
          SAIHOON
        </div>
      </div>
    </main>
  );
}
