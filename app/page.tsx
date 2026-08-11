import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-800 text-white">

      {/* Header */}
      <header className="bg-green-950 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-6">
          <div>
            <h1 className="text-4xl font-bold">🏫 MUNAFASA 2026</h1>
            <p className="text-green-300">
              Global Public School
            </p>
          </div>

          <nav className="flex gap-4">
            <Link href="/teams" className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500">
              Teams
            </Link>

            <Link href="/results" className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500">
              Results
            </Link>

            <Link href="/call-list" className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400">
              Call List
            </Link>

            <Link href="/login" className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500">
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center py-24">
        <h2 className="text-6xl font-extrabold text-yellow-400">
          MUNAFASA 2026
        </h2>

        <p className="mt-6 text-2xl">
          Inter House Islamic Arts Festival
        </p>

        <p className="text-green-300 mt-2">
          Global Public School
        </p>
      </section>

      {/* Teams */}
      <section className="max-w-7xl mx-auto px-8 py-10">
        <h2 className="text-4xl font-bold text-center mb-10">
          House Teams
        </h2>

        <div className="grid md:grid-cols-4 gap-6">

          <div className="bg-red-600 rounded-xl p-8 text-center shadow-lg">
            <h3 className="text-3xl font-bold">DIJLA</h3>
            <p className="mt-3">Points : 0</p>
          </div>

          <div className="bg-blue-600 rounded-xl p-8 text-center shadow-lg">
            <h3 className="text-3xl font-bold">FURATH</h3>
            <p className="mt-3">Points : 0</p>
          </div>

          <div className="bg-yellow-400 text-black rounded-xl p-8 text-center shadow-lg">
            <h3 className="text-3xl font-bold">NILE</h3>
            <p className="mt-3">Points : 0</p>
          </div>

          <div className="bg-green-600 rounded-xl p-8 text-center shadow-lg">
            <h3 className="text-3xl font-bold">SAIHOON</h3>
            <p className="mt-3">Points : 0</p>
          </div>

        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-8 py-10">
        <h2 className="text-4xl font-bold text-center mb-10">
          Categories
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">

          <div className="bg-white text-black rounded-xl p-6 text-center font-bold">
            Kiddies
          </div>

          <div className="bg-white text-black rounded-xl p-6 text-center font-bold">
            Sub Junior
          </div>

          <div className="bg-white text-black rounded-xl p-6 text-center font-bold">
            Junior
          </div>

          <div className="bg-white text-black rounded-xl p-6 text-center font-bold">
            Senior
          </div>

          <div className="bg-white text-black rounded-xl p-6 text-center font-bold">

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-950 mt-16 py-6 text-center text-green-300">
        Â© 2026 Global Public School | MUNAFASA 2026
      </footer>

    </main>
  );
}
