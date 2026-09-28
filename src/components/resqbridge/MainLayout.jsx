import React from "react";
import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";
import AppShell from "./AppShell";

export default function MainLayout() {
  return (
    <AppShell>
      <div className="flex-1 pb-28">
        <Outlet />
      </div>
      <BottomNavigation />
    </AppShell>
  );
}