// import React from "react";
// import NavBar from "./components/layout/NavBar.jsx";
// import AppRoutes from "./routes/app-routes.jsx";

// export default function App() {
//   return (
//     <div className="min-h-screen">
//       <NavBar />
//       <AppRoutes />
//     </div>
//   );
// }

// import React from "react";
// import { BrowserRouter } from "react-router-dom";
// import AppRoutes from "./routes/app-routes.jsx";
// import { AuthProvider } from "./context/auth-context.jsx";

// export default function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <AppRoutes />
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

import React from "react";
import AppRoutes from "./routes/app-routes.jsx";

export default function App() {
  return <AppRoutes />;
}
