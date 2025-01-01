"use client";

import { auth } from "@/lib/firebase/firebaseConfig";
import { updatePassword } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordSetup = async () => {
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user found.");

      await updatePassword(user, password);

      alert("Password successfully created!");
      router.push("/login");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Your Password</h1>
      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={handlePasswordSetup}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        {loading ? "Setting Password..." : "Set Password"}
      </button>
    </div>
  );
}
