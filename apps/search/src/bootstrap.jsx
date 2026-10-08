// Standalone development mode only — the shell imports SearchApp instead.
// Inside the shell, SearchApp already sits in the shell's Router; here we
// must provide one ourselves because SearchApp uses useSearchParams.
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@mfe-shop/ui/styles.css";
import "./search.css";
import SearchApp from "./SearchApp";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <SearchApp />
  </BrowserRouter>
);
