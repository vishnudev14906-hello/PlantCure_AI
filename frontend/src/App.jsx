import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { UploadPredictPage } from './pages/UploadPredictPage';
import { PredictionResultPage } from './pages/PredictionResultPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { DiseaseEncyclopediaPage } from './pages/DiseaseEncyclopediaPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  {/* Public Core Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/scan" element={<UploadPredictPage />} />
                  <Route path="/results" element={<PredictionResultPage />} />
                  <Route path="/encyclopedia" element={<DiseaseEncyclopediaPage />} />
                  <Route path="/about" element={<AboutPage />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

                  {/* Protected Routes */}
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <ScanHistoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <UserProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all 404 */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
