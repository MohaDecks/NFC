import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";

if (localStorage.getItem("mubarek-theme") === "dark" || localStorage.getItem("bravio-theme") === "dark") {
  document.documentElement.classList.add("dark");
}

function ThemedToaster() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const observer = new MutationObserver(() => setDark(document.documentElement.classList.contains("dark")));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return <Toaster theme={dark ? "dark" : "light"} richColors position="top-right" />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
      <ThemedToaster />
    </HelmetProvider>
  </StrictMode>,
);
