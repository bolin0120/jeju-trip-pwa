import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// 👇 這兩行一定要在「plugin 已載入」的前提下
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
