import { Routes, Route, Link } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";

export default function App() {
  return (
    <Routes>
      <Route
        path="/sign-in/*"
        element={<SignIn routing="path" path="/sign-in" />}
      />
      <Route
        path="/sign-up/*"
        element={<SignUp routing="path" path="/sign-up" />}
      />

      <Route
        path="/"
        element={
          <div style={{ padding: 20 }}>
            <h2>Promise Tracker SL ✅</h2>
            <p>Clerk routes:</p>
            <ul>
              <li>
                <Link to="/sign-in">Sign In</Link>
              </li>
              <li>
                <Link to="/sign-up">Sign Up</Link>
              </li>
            </ul>
          </div>
        }
      />
    </Routes>
  );
}
