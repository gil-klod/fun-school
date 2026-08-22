"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const verified = searchParams.get("verified") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      rememberMe: rememberMe ? "true" : "false",
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t("auth.invalidCredentials"));
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="bg-white/90 rounded-3xl shadow-xl border-2 border-indigo-100 p-8 w-full max-w-md">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <div className="text-center mb-8">
          <span className="text-5xl">🎒</span>
          <h1 className="text-3xl font-bold text-indigo-700 mt-2">{t("auth.loginTitle")}</h1>
          <p className="text-gray-500">{t("auth.loginSubtitle")}</p>
        </div>

        {verified && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 mb-4 text-green-800 text-sm text-center">
            {t("auth.emailVerifiedBanner")}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-400 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-indigo-200 text-indigo-600 focus:ring-indigo-400"
            />
            <span className="text-sm text-gray-700">{t("auth.rememberMe")}</span>
          </label>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="game-btn game-btn-primary w-full disabled:opacity-50"
          >
            {loading ? t("auth.loggingIn") : t("auth.login")}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
            {t("auth.signUp")}
          </Link>
        </p>
      </div>
    </main>
  );
}
