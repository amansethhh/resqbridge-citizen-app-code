import React from "react";

/**
 * Phone-first application shell.
 * Constrains the app to a phone-width frame (max 430px) centered on a calm
 * backdrop for desktop preview, while filling the full viewport on actual
 * phones. Applies top safe-area and prevents horizontal overflow.
 */
export default function AppShell({ children, className = "" }) {
  return (
    <div className="min-h-screen w-full flex justify-center bg-slate-200/60 dark:bg-slate-950">
      <div
        className={`relative w-full max-w-[430px] min-h-screen flex flex-col rq-bg-gradient rq-safe-top overflow-x-hidden rq-screen-enter ${className}`}
      >
        {children}
      </div>
    </div>
  );
}