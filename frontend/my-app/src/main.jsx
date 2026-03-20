
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // For navbar toggle
import "./styles/home.css"


import { GoogleOAuthProvider } from "@react-oauth/google";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="474223658396-gp2hbk4jkv06hsje521bq2ds9vv2ga9k.apps.googleusercontent.com">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);