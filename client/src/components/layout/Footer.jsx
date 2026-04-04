// import React from "react";
// import { Link } from "react-router-dom";

// export default function Footer() {
//   return (
//     <footer className="border-t border-slate-200 bg-white">
//       <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-600">
//         <div>© {new Date().getFullYear()} Promise Tracker SL</div>

//         <div className="flex items-center gap-4">
//           <Link to="/politicians" className="hover:text-slate-900">
//             Politicians
//           </Link>
//           <Link to="/parties" className="hover:text-slate-900">
//             Parties
//           </Link>
//           <Link to="/petitions" className="hover:text-slate-900">
//             Petitions
//           </Link>
//         </div>
//       </div>
//     </footer>
//   );
// }

import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500">
        © {new Date().getFullYear()} Promise Tracker SL
      </div>
    </footer>
  );
}
