"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div className="bg-blue-900 text-white p-4 flex gap-6">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/students">Students</Link>
      <Link href="/programmes">Programmes</Link>
      <Link href="/registrations">Registrations</Link>
      <Link href="/media/results">Results</Link>
      <Link href="/media/certificates">Certificates</Link>
    </div>
  );
}