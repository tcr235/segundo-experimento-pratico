import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import StudentsPage from "./pages/StudentsPage";
import ClassesPage from "./pages/ClassesPage";
import EvaluationsPage from "./pages/EvaluationsPage";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: "system-ui, sans-serif", padding: 20 }}>
        <header style={{ marginBottom: 20 }}>
          <h1>Sistema</h1>
          <nav>
            <Link to="/students" style={{ marginRight: 10 }}>
              Students
            </Link>
            <Link to="/classes" style={{ marginRight: 10 }}>
              Classes
            </Link>
            <Link to="/evaluations">Evaluations</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/evaluations" element={<EvaluationsPage />} />
            <Route path="/" element={<StudentsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
