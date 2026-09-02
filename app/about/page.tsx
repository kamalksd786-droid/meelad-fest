import Navbar from "../components/Navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-green-950 text-white p-10">
        <div className="max-w-5xl mx-auto">

          <h1 className="text-5xl font-bold text-center mb-8">
            About MUNAFASA 2026
          </h1>

          <p className="text-xl text-center text-green-200 mb-10">
            MUNAFASA 2026 is the Inter House Islamic Arts Festival of
            THE GLOBAL PUBLIC SHOOL . Students from different categories
            participate in various academic, literary, and cultural
            competitions.
          </p>

          <div className="grid md:grid-cols-2 gap-6">

            <div className="bg-green-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-3">
                Our Vision
              </h2>

              <p>
                To inspire excellence, creativity, teamwork, and Islamic
                values through healthy competition.
              </p>
            </div>

            <div className="bg-green-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-3">
                Event Highlights
              </h2>

              <ul className="list-disc pl-5 space-y-2">
                <li>120+ Programmes</li>
                <li>1000+ Students</li>
                <li>4 House Teams</li>
                <li>5 Categories</li>
              </ul>
            </div>

          </div>

        </div>
      </main>
    </>
  );
}