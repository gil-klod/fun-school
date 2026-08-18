"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devUrl, setDevUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setDevUrl("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        return;
      }

      setSuccess(data.message);
      if (data.devVerifyUrl) setDevUrl(data.devVerifyUrl);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="bg-white/90 rounded-3xl shadow-xl border-2 border-indigo-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🎒</span>
          <h1 className="text-3xl font-bold text-indigo-700 mt-2">Join Fun School</h1>
          <p className="text-gray-500">Create an account to track your progress</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-green-800">
              {success}
            </div>
            {devUrl && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-sm">
                <p className="text-amber-800 font-medium mb-2">Dev mode — verify link:</p>
                <a href={devUrl} className="text-indigo-600 break-all hover:underline">
                  {devUrl}
                </a>
              </div>
            )}
            <Link href="/login" className="game-btn game-btn-primary inline-block">
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-400 focus:outline-none"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-400 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-400 focus:outline-none"
                placeholder="At least 6 characters"
              />
            </div>

            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="game-btn game-btn-primary w-full disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>
        )}

        {!success && (
          <p className="text-center text-gray-500 mt-6 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
