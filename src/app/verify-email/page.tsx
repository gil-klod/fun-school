"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLocale();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      queueMicrotask(() => {
        setStatus("error");
        setMessage(t("auth.verifyFailed"));
      });
      return;
    }

    fetch(`/api/auth/verify?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(t("auth.verifySuccess"));
          setTimeout(() => router.push("/login?verified=true"), 2500);
        } else {
          setStatus("error");
          setMessage(data.error ?? t("auth.verifyFailed"));
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage(t("auth.verifyFailed"));
      });
  }, [token, router, t]);

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="bg-white/90 rounded-3xl shadow-xl border-2 border-indigo-100 p-8 w-full max-w-md text-center">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <span className="text-5xl">
          {status === "loading" ? "⏳" : status === "success" ? "✅" : "❌"}
        </span>
        <h1 className="text-2xl font-bold text-gray-800 mt-4">
          {status === "loading" && t("auth.verifying")}
          {status === "success" && t("auth.verifySuccess")}
          {status === "error" && t("auth.verifyFailed")}
        </h1>
        {message && status !== "loading" && <p className="text-gray-600 mt-2">{message}</p>}
        {status === "success" && (
          <p className="text-sm text-gray-400 mt-4">{t("auth.redirecting")}</p>
        )}
        {status === "error" && (
          <Link href="/register" className="game-btn game-btn-primary inline-block mt-6">
            {t("auth.tryAgain")}
          </Link>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
