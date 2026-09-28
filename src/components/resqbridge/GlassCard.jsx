import React from "react";

const VARIANTS = {
  default: "rq-glass",
  strong: "rq-glass-strong",
  subtle: "rq-glass-subtle",
  danger: "rq-glass-danger",
};

/**
 * Canonical glass surface for the ResQBridge design system.
 * variants: default | strong | subtle | danger
 */
export default function GlassCard({
  children,
  className = "",
  padded = true,
  onClick,
  variant = "default",
  as: Tag = "div",
}) {
  const base = VARIANTS[variant] || VARIANTS.default;
  return (
    <Tag
      onClick={onClick}
      className={`rounded-3xl ${base} ${padded ? "p-4" : ""} ${
        onClick
          ? "cursor-pointer active:scale-[0.985] transition-transform duration-150"
          : ""
      } ${className}`}
    >
      {children}
    </Tag>
  );
}