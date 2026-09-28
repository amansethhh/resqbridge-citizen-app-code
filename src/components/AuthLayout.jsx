import React from "react";
import AppLogo from "@/components/resqbridge/AppLogo";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center rq-bg-gradient px-4 py-10 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-rq-cyan/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-rq-primary/15 blur-3xl" />
      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <AppLogo size="md" showTagline />
        </div>
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-rq-primary to-rq-cyan mb-3"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 8px 18px -6px rgba(29,111,232,0.5)" }}
          >
            <Icon className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-rq-navy">{title}</h1>
          {subtitle && <p className="text-rq-muted mt-1 text-sm">{subtitle}</p>}
        </div>
        <div className="rq-glass rounded-3xl shadow-xl shadow-rq-primary/5 p-6 sm:p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-rq-muted mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}