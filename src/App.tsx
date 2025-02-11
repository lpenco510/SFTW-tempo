import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import AyudaPage from "./components/ayuda/AyudaPage";
import FeedbackPage from "./components/feedback/FeedbackPage";
import ConfiguracionPage from "./components/configuracion/ConfiguracionPage";
import LiquidacionIVAPage from "./components/analisis/LiquidacionIVAPage";
import AnalisisPage from "./components/analisis/AnalisisPage";
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
                  <MainLayout>
                    <Home />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/productos"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProductosPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/proveedores"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProveedoresPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/comex/general"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <RegimenGeneralPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/comex/courier"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CourierPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/comex/exports"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ExportacionesPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analisis/inventario"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <InventarioPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analisis/iva"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <LiquidacionIVAPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analisis/reportes"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AnalisisPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ayuda"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AyudaPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <FeedbackPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ConfiguracionPage />
                  </MainLayout>
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
