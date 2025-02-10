import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import ProductosPage from "./components/productos/ProductosPage";
import ProveedoresPage from "./components/proveedores/ProveedoresPage";
import RegimenGeneralPage from "./components/comex/RegimenGeneralPage";
import CourierPage from "./components/comex/CourierPage";
import ExportacionesPage from "./components/comex/ExportacionesPage";
import InventarioPage from "./components/analisis/InventarioPage";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import { AuthProvider, useAuth } from "./components/auth/AuthProvider";
import routes from "tempo-routes";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            Loading...
          </div>
        }
      >
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/productos"
              element={
                <ProtectedRoute>
                  <ProductosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proveedores"
              element={
                <ProtectedRoute>
                  <ProveedoresPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comex/general"
              element={
                <ProtectedRoute>
                  <RegimenGeneralPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comex/courier"
              element={
                <ProtectedRoute>
                  <CourierPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comex/exports"
              element={
                <ProtectedRoute>
                  <ExportacionesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analisis/inventario"
              element={
                <ProtectedRoute>
                  <InventarioPage />
                </ProtectedRoute>
              }
            />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </div>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
