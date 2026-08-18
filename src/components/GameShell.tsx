"use client";

interface GameShellProps {
  title: string;
  titleHe?: string;
  emoji: string;
  children: React.ReactNode;
  dir?: "ltr" | "rtl";
}

export function GameShell({ title, titleHe, emoji, children, dir = "ltr" }: GameShellProps) {
  return (
    <div className="max-w-2xl mx-auto" dir={dir}>
      <div className="text-center mb-6">
        <span className="text-5xl">{emoji}</span>
        <h1 className="text-3xl font-bold text-gray-800 mt-2">{title}</h1>
        {titleHe && (
          <p className="text-xl text-gray-600" dir="rtl">
            {titleHe}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
