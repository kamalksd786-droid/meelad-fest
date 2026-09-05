"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: Props) {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-gray-100">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex min-w-0 flex-1 flex-col">

        <Header />

        <main className="w-full min-w-0 flex-1 bg-gray-100 p-4 sm:p-6 lg:p-8">
          <div className="w-full min-w-0">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}