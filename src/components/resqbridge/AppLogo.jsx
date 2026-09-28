import React from "react";
import { LOGO_URL, APP_NAME, TAGLINE } from "@/constants/brand";

export default function AppLogo({ size = "md", showText = true, showTagline = false, className = "" }) {
  const sizes = { sm: "w-8 h-8", md: "w-11 h-11", lg: "w-20 h-20", xl: "w-28 h-28" };
  const textSizes = { sm: "text-base", md: "text-lg", lg: "text-3xl", xl: "text-4xl" };
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={LOGO_URL} alt={APP_NAME} className={`${sizes[size]} object-contain`} />
      {showText && (
        <div className="leading-tight">
          <div className={`font-bold text-rq-navy ${textSizes[size]}`}>
            Res<span className="text-rq-primary">Q</span>Bridge
          </div>
          {showTagline && (
            <div className="text-[9px] uppercase tracking-widest text-rq-muted">{TAGLINE}</div>
          )}
        </div>
      )}
    </div>
  );
}