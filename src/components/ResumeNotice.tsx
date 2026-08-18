"use client";

interface ResumeNoticeProps {
  onDismiss: () => void;
}

export function ResumeNotice({ onDismiss }: ResumeNoticeProps) {
  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
      <p className="text-blue-800 font-medium">📂 Resumed your last session!</p>
      <button onClick={onDismiss} className="text-blue-500 text-sm hover:text-blue-700">
        Got it
      </button>
    </div>
  );
}
