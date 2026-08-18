"use client";

import { useLocale } from "@/i18n/LocaleProvider";

interface ResumeNoticeProps {
  onDismiss: () => void;
}

export function ResumeNotice({ onDismiss }: ResumeNoticeProps) {
  const { t } = useLocale();
  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
      <p className="text-blue-800 font-medium">{t("games.resumed")}</p>
      <button onClick={onDismiss} className="text-blue-500 text-sm hover:text-blue-700">
        {t("common.gotIt")}
      </button>
    </div>
  );
}
