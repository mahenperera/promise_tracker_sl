// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import { ClerkProvider } from "@clerk/clerk-react";
// import App from "./App.jsx";
// import "./index.css";

// const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// if (!publishableKey) {
//   throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in client/.env");
// }

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <ClerkProvider publishableKey={publishableKey}>
//       <BrowserRouter>
//         <App />
//       </BrowserRouter>
//     </ClerkProvider>
//   </React.StrictMode>,
// );

// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import App from "./App.jsx";
// import "./index.css";
// import { AuthProvider } from "./context/auth-context.jsx";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <AuthProvider>
//         <App />
//       </AuthProvider>
//     </BrowserRouter>
//   </React.StrictMode>,
// );

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

import { AuthProvider } from "./context/auth-context.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
