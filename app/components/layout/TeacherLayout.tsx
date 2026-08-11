"use client";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-green-800 text-white p-5">
        <h1 className="text-2xl font-bold mb-6">
          Teacher Portal
        </h1>

        <nav className="space-y-3">
          <a href="/teacher/dashboard" className="block">
            Dashboard
          </a>

          <a href="/teacher/registration" className="block">
            Student Registration
          </a>

          <a href="/teacher/my-registrations" className="block">
            My Registrations
          </a>

          <a href="/teacher/chest-cards" className="block">
            Chest Cards
          </a>
        </nav>
      </aside>

      <main className="flex-1 p-6 bg-gray-100">
        {children}
      </main>
    </div>
  );
}