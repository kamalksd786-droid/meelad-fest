import Navbar from "../components/Navbar";

export default function CategoriesPage() {
  const categories = [
    "Kiddies",
    "Sub Junior",
    "Junior",
    "Senior",

  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-green-950 text-white p-10">
        <h1 className="text-5xl font-bold text-center mb-12">
          📚 Categories
        </h1>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div
              key={category}
              className="bg-green-700 hover:bg-green-600 rounded-xl p-8 text-center text-3xl font-bold cursor-pointer"
            >
              {category}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

