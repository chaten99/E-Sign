import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicRoute } from "./components/auth/PublicRoute";
import { RootRedirect } from "./components/auth/RootRedirect";
import { SpinnerCustom } from "./components/ui/spinner";
import Login from "./pages/authPages/LoginPage";
import Unauthorized from "./pages/authPages/Unauthorized";
import AdminPage from "./pages/adminPages/AdminPage";
import OfficerPage from "./pages/officerPages/OfficerPage";
import ReaderPage from "./pages/readerPages/ReaderPage";
import RequestPublicPage from "./pages/requestPages/RequestPublicPage";
import { useAuthStore } from "./store/authStore";

function App() {
  const authReady = useAuthStore((state) => state.authReady);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <SpinnerCustom />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" expand={true} />

      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/requests/:id" element={<RequestPublicPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer"
          element={
            <ProtectedRoute requiredRole="officer">
              <OfficerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reader"
          element={
            <ProtectedRoute requiredRole="reader">
              <ReaderPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
