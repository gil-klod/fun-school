"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function RegisterPage() {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loginReady, setLoginReady] = useState(false);
  const [devUrl, setDevUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
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

      setSuccess(true);
      setLoginReady(!!data.loginReady);
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
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <div className="text-center mb-8">
          <span className="text-5xl">🎒</span>
          <h1 className="text-3xl font-bold text-indigo-700 mt-2">{t("auth.registerTitle")}</h1>
          <p className="text-gray-500">{t("auth.registerSubtitle")}</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-green-800">
              {loginReady ? t("auth.registerSuccessLogin") : t("auth.checkEmail")}
            </div>
            {devUrl && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-sm">
                <p className="text-amber-800 font-medium mb-2">{t("auth.devVerifyLink")}</p>
                <a href={devUrl} className="text-indigo-600 break-all hover:underline">
                  {devUrl}
                </a>
              </div>
            )}
            <Link href="/login" className="game-btn game-btn-primary inline-block">
              {t("auth.goToLogin")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.name")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder={t("auth.passwordHint")}
                className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="game-btn game-btn-primary w-full disabled:opacity-50"
            >
              {loading ? t("auth.creatingAccount") : t("auth.signUp")}
            </button>
          </form>
        )}

        {!success && (
          <p className="text-center text-gray-500 mt-6 text-sm">
            {t("auth.hasAccount")}{" "}
            <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
              {t("auth.login")}
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
