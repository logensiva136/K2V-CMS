import React from "react";
import { createRoot } from "react-dom/client";
import "../styles/admin.css";
import { Admin } from "./Admin.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Admin />
  </React.StrictMode>
);
