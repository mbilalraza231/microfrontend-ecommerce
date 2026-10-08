// Standalone development mode only. When the shell consumes this MFE it
// imports ShopApp directly from remoteEntry.js — this file is never used.
import React from "react";
import { createRoot } from "react-dom/client";
import "@mfe-shop/ui/styles.css";
import "./shop.css";
import ShopApp from "./ShopApp";

createRoot(document.getElementById("root")).render(<ShopApp />);
