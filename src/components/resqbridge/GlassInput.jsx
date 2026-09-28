import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Glass input container — translucent field with label, optional leading
 * icon, helper and error text. Keeps text fully opaque for readability.
 */
export default function GlassInput({
  label,
  icon: Icon,
  helper,
  error,
  className = "",
  inputClassName = "",
  id,
  ...props
}) {
  const generatedId = React.useId();
  const fieldId = id || `gi-${generatedId}`;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <Label htmlFor={fieldId} className="text-sm font-semibold text-rq-navy px-1">
          {label}
        </Label>
      )}
      <div
        className={`flex items-center gap-2 rounded-2xl rq-glass-subtle px-3 h-12 transition-shadow ${
          error ? "ring-1 ring-rq-red/50" : "focus-within:ring-1 focus-within:ring-rq-primary/40"
        }`}
      >
        {Icon && <Icon className="w-4 h-4 text-rq-muted flex-shrink-0" />}
        <Input
          id={fieldId}
          className="flex-1 h-full border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 text-rq-navy placeholder:text-rq-muted/70"
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-rq-red font-medium px-1">{error}</p>
      ) : helper ? (
        <p className="text-xs text-rq-muted px-1">{helper}</p>
      ) : null}
    </div>
  );
}