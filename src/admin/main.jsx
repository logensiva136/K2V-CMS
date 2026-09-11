import React from "react";
import { createRoot } from "react-dom/client";
import "../styles/admin.css";
import { Admin } from "./Admin.jsx";
import { AuthGate } from "./auth.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthGate>
      <Admin />
    </AuthGate>
  </React.StrictMode>
);
