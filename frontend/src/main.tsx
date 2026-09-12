import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";

if (localStorage.getItem("mubarek-theme") === "dark" || localStorage.getItem("bravio-theme") === "dark") {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
      <Toaster richColors position="top-center" />
    </HelmetProvider>
  </StrictMode>,
);
