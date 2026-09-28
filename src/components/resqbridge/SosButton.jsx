import React, { useState } from "react";
import { Phone } from "lucide-react";

/**
 * Premium 3D glass Emergency SOS control — built entirely in code (no raster asset).
 * Layered visual: outer emergency glow halo → translucent glass ring → deep red 3D
 * body with inner/outer shadows + top highlight → phone icon + SOS label.
 *
 * Remains a real, accessible <button> with distinct states:
 *   default | activating | active | disabled
 *
 * Props:
 *  - size:    button diameter in px (default 112)
 *  - state:   visual state (default "default")
 *  - label:   center label (default "SOS")
 *  - sublabel: optional small caption under the label
 */
export default function SosButton({
  onClick,
  size = 112,
  state = "default",
  label = "SOS",
  sublabel,
  className = "",
  ...props
}) {
  const [pressed, setPressed] = useState(false);
  const disabled = state === "disabled";
  const isActive = state === "active";
  const isActivating = state === "activating";

  const halo = size + 22;

  const glow = isActive || isActivating
    ? "radial-gradient(circle, rgba(226,54,54,0.42) 0%, rgba(226,54,54,0.12) 46%, rgba(226,54,54,0) 72%)"
    : "radial-gradient(circle, rgba(226,54,54,0.22) 0%, rgba(226,54,54,0.06) 52%, rgba(226,54,54,0) 72%)";

  const body = disabled
    ? "linear-gradient(160deg, #d99a9a 0%, #c08484 100%)"
    : "radial-gradient(120% 90% at 50% 16%, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0) 40%), linear-gradient(160deg, #f0534f 0%, #d62828 52%, #a51d1d 100%)";

  const shadow = pressed
    ? "inset 0 6px 14px rgba(120,10,10,0.55), inset 0 -2px 6px rgba(255,255,255,0.18), 0 2px 8px rgba(226,54,54,0.35)"
    : "inset 0 2px 3px rgba(255,255,255,0.55), inset 0 -8px 16px rgba(120,10,10,0.40), 0 12px 26px -8px rgba(226,54,54,0.55)";

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: halo, height: halo }}>
      {/* Outer emergency glow halo */}
      <div
        aria-hidden
        className={`absolute inset-0 rounded-full ${isActivating ? "rq-sos-pulse" : ""}`}
        style={{
          background: glow,
          filter: "blur(6px)",
          opacity: disabled ? 0 : 1,
          transition: "opacity 300ms ease",
        }}
      />
      {/* Translucent glass ring */}
      <div
        aria-hidden
        className="absolute rounded-full"
        style={{
          inset: 6,
          background: "rgba(255,255,255,0.16)",
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.5), 0 6px 16px -8px rgba(226,54,54,0.45)",
        }}
      />
      {/* The real button */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        aria-label={label === "SOS" ? "Activate emergency SOS" : label}
        className="relative rounded-full flex flex-col items-center justify-center text-white select-none outline-none focus-visible:ring-4 focus-visible:ring-rq-red/40 transition-transform"
        style={{
          width: size,
          height: size,
          transform: pressed ? "scale(0.94)" : "scale(1)",
          transition: "transform 160ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 200ms ease, filter 200ms ease",
          background: body,
          boxShadow: shadow,
          border: "1px solid rgba(255,255,255,0.35)",
        }}
        {...props}
      >
        {/* Inner top highlight — gives the 3D raised surface */}
        <span
          aria-hidden
          className="absolute"
          style={{
            top: "12%",
            left: "16%",
            right: "16%",
            height: "38%",
            borderRadius: "50% 50% 46% 46%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)",
            opacity: disabled ? 0.3 : 0.7,
          }}
        />
        <Phone className="relative w-6 h-6 mb-0.5 drop-shadow-sm" strokeWidth={2.4} />
        <span className="relative text-base font-extrabold tracking-[0.18em] drop-shadow-sm">{label}</span>
        {sublabel && (
          <span className="relative text-[9px] font-semibold tracking-wide opacity-80 mt-0.5">{sublabel}</span>
        )}
      </button>
    </div>
  );
}