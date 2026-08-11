export default function Dijla() {
  return (
    <main className="min-h-screen bg-red-700 text-white flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">DIJLA</h1>

      <p className="mt-6 text-2xl">
        Team Points : 0
      </p>

      <div className="mt-10 bg-white text-black p-8 rounded-xl w-96">
        <h2 className="text-2xl font-bold mb-4">
          Categories
        </h2>

        <ul className="space-y-3">
          <li>Kiddies</li>
          <li>Sub Junior</li>
          <li>Junior</li>
          <li>Senior</li>

        </ul>
      </div>
    </main>
  );
}
