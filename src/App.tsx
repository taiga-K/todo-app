import { useEffect } from "react";
import { Outlet } from "react-router";
import { useAuth } from "wasp/client/auth";
import "./App.css";
import { Sidebar } from "./shared/components/Sidebar";

export function App() {
  const { data: user } = useAuth();

  useEffect(() => {
    document.documentElement.lang = "ja";
  }, []);

  return (
    <main className="flex min-h-screen w-full bg-background text-foreground">
      {user ? <Sidebar /> : null}
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </main>
  );
}
