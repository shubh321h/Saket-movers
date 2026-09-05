import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ReviewFlow from "./pages/ReviewFlow";
import QrPage from "./pages/QrPage";

export default function App() {
  return (
    <div className="grain relative min-h-[100dvh] overflow-x-hidden bg-ink">
      <div className="aura" aria-hidden="true" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/review" replace />} />
          <Route path="/review" element={<ReviewFlow />} />
          <Route path="/qr" element={<QrPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
