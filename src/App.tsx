import { useEffect } from "react";
import { Outlet } from "react-router";
import "./App.css";
import { Header } from "./shared/components/Header";

export function App() {
  useEffect(() => {
    document.documentElement.lang = "ja";
  }, []);

  return (
    <main className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <Header />
      <Outlet />
    </main>
  );
}
