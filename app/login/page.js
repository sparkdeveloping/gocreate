"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/firebaseConfig";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      router.push("/");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={handleLogin}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}
