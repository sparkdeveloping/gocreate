"use client";

import { useState, useEffect } from "react";
import {
  db,
  collection,
  query,
  where,
  getDocs,
} from "@/lib/firebase/firebaseConfig";

export default function TrackerAdmin() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: "", clockStatus: "" });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const logsRef = collection(db, "trackerLogs");
      let logsQuery = logsRef;

      if (filters.type) {
        logsQuery = query(logsRef, where("type", "==", filters.type));
      }
      if (filters.clockStatus) {
        logsQuery = query(
          logsRef,
          where("clockStatus", "==", filters.clockStatus)
        );
      }

      const querySnapshot = await getDocs(logsQuery);
      const logsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLogs(logsData);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Tracker Log</h1>
      <div className="mb-6 flex gap-4">
        {/* Filters */}
        <select
          className="p-2 border rounded"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="Member">Member</option>
          <option value="Staff">Staff</option>
          <option value="StudentTech">Student Tech</option>
        </select>
        <select
          className="p-2 border rounded"
          value={filters.clockStatus}
          onChange={(e) =>
            setFilters({ ...filters, clockStatus: e.target.value })
          }
        >
          <option value="">All Status</option>
          <option value="ClockIn">Clock In</option>
          <option value="ClockOut">Clock Out</option>
        </select>
      </div>

      {/* Tracker Logs */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full bg-white shadow rounded">
          <thead>
            <tr>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">Clock Status</th>
              <th className="border px-4 py-2">Time</th>
              <th className="border px-4 py-2">Guests</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="border px-4 py-2">{log.name}</td>
                <td className="border px-4 py-2">{log.type}</td>
                <td className="border px-4 py-2">{log.clockStatus}</td>
                <td className="border px-4 py-2">
                  {new Date(log.time).toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  {log.guests?.length > 0
                    ? log.guests
                        .map((guest) => `${guest.firstName} ${guest.lastName}`)
                        .join(", ")
                    : "No Guests"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
