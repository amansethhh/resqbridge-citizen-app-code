import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AppLogo from "./AppLogo";

export default function ScreenHeader({ onBack, right, showLogo = true }) {
  const navigate = useNavigate();
  return (
    <div className="relative flex items-center mb-4 h-10">
      <button
        onClick={onBack || (() => navigate(-1))}
        className="w-10 h-10 rounded-full rq-glass flex items-center justify-center text-rq-navy shadow-sm active:scale-95 transition-transform absolute left-0 z-10"
        aria-label="Back"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      {showLogo && (
        <div className="absolute left-1/2 -translate-x-1/2">
          <AppLogo size="sm" />
        </div>
      )}
      <div className="absolute right-0 flex justify-end min-w-10">{right}</div>
    </div>
  );
}