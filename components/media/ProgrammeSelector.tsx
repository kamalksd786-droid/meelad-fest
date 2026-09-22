"use client";

import { useMemo, useState } from "react";

type Programme = {
  id: number;
  programme_code?: string;
  programme_name: string;
};

type Props = {
  programmes: Programme[];
  selected: string;
  onChange: (value: string) => void;
};

export default function ProgrammeSelector({
  programmes,
  selected,
  onChange,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredProgrammes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return programmes;
    }

    return programmes.filter((programme) => {
      const id = String(programme.id).toLowerCase();

      const code = (
        programme.programme_code || ""
      ).toLowerCase();

      const name =
        programme.programme_name.toLowerCase();

      return (
        id.includes(query) ||
        code.includes(query) ||
        name.includes(query)
      );
    });
  }, [programmes, search]);

  return (
    <div className="space-y-3">

      {/* Search */}
      <div>
        <label className="block text-sm font-semibold mb-1">
          Search Programme
        </label>

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search by Programme ID or Name..."
          className="border rounded-lg p-3 w-full"
        />
      </div>

      {/* Programme selector */}
      <div>
        <label className="block text-sm font-semibold mb-1">
          Select Programme
        </label>

        <select
          className="border rounded-lg p-3 w-full"
          value={selected}
          onChange={(e) =>
            onChange(e.target.value)
          }
        >
          <option value="">
            Select Programme
          </option>

          {filteredProgrammes.map(
            (programme) => (
              <option
                key={programme.id}
                value={programme.id}
              >
                {programme.id} —{" "}
                {programme.programme_name}
              </option>
            )
          )}
        </select>

        {filteredProgrammes.length === 0 && (
          <p className="text-sm text-red-500 mt-2">
            No programme found.
          </p>
        )}
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-500">
        Showing {filteredProgrammes.length} programme
        {filteredProgrammes.length !== 1
          ? "s"
          : ""}
      </p>

    </div>
  );
}