"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <div className="flex gap-3 mb-6">

      <button
        onClick={() => router.back()}
        className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold"
      >
        ← Back
      </button>

      <Link
        href="/dashboard"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
      >
        🏠 Dashboard
      </Link>

    </div>
  );
}