// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";

// import Home from "../pages/home/Home";
// import PoliticalNews from "../pages/news/PoliticalNews";

// export default function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />

//       {/* News */}
//       <Route path="/news" element={<PoliticalNews />} />

//       {/* fallback */}
//       <Route path="*" element={<Navigate to="/news" replace />} />
//     </Routes>
//   );
// }

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PoliticalNews from "../pages/news/PoliticalNews";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/news" element={<PoliticalNews />} />
      <Route path="/" element={<Navigate to="/news" replace />} />
      <Route path="*" element={<Navigate to="/news" replace />} />
    </Routes>
  );
}
