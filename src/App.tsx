import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import AyudaPage from "./components/ayuda/AyudaPage";
import FeedbackPage from "./components/feedback/FeedbackPage";
import ConfiguracionPage from "./components/configuracion/ConfiguracionPage";
import LiquidacionIVAPage from "./components/finanzas/LiquidacionIVAPage";
import AnalisisPage from "./components/finanzas/AnalisisPage";
import ReportesPage from "./components/finanzas/ReportesPage";
import Home from "./components/home";
import ProductosPage from "./components/productos/ProductosPage";
import RegimenGeneralPage from "./components/comex/RegimenGeneralPage";
import CourierPage from "./components/comex/CourierPage";
import ExportacionesPage from "./components/comex/ExportacionesPage";
import AduanasPage from "./components/comex/AduanasPage";
import TrackingPage from "./components/comex/TrackingPage";
import TarifasPage from "./components/comex/TarifasPage";
import InventarioPage from "./components/inventario/InventarioPage";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import { AuthProvider, useAuth } from "./components/auth/AuthProvider";
import routes from "tempo-routes";
import { Toaster } from "@/components/ui/toaster"

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
              path="/comex/aduanas"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AduanasPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/comex/tracking"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <TrackingPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/comex/tarifas"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <TarifasPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/finanzas/iva"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <LiquidacionIVAPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/finanzas/analisis"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AnalisisPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/finanzas/reportes"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ReportesPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventario"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <InventarioPage />
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
          <Toaster />
        </div>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
