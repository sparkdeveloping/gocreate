"use client";

import MembershipsTable from "@/components/MembershipsTable";

export default function MembershipsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-2xl font-bold mb-4">Memberships</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <MembershipsTable />
        </div>
      </div>
    </div>
  );
}
