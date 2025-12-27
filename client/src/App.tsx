import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './layouts/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Product } from './pages/Product';
import { Docs } from './pages/Docs';

// Private Pages
import { PatientList } from './pages/PatientList';
import { PatientDetail } from './pages/PatientDetail';
import { Integrations } from './pages/Integrations';
import { Profile } from './pages/Profile';

import { useAuth } from './context/AuthContext';

function RedirectByRole() {
  const { user } = useAuth();
  if (user?.role === 'PATIENT') {
    return <Navigate to="profile" replace />;
  }
  return <Navigate to="patients" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/product" element={<Product />} />

              <Route path="/signup" element={<SignUp />} />
              <Route path="/product" element={<Product />} />
              <Route path="/docs" element={<Docs />} />

              {/* Protected Routes Wrapper */}
              <Route element={<ProtectedRoute />}>
                <Route path="/app" element={<Layout />}>
                  <Route index element={<RedirectByRole />} />
                  <Route path="patients" element={<PatientList />} />
                  <Route path="patients/:id" element={<PatientDetail />} />

                  <Route path="integrations" element={<Integrations />} />
                  {/* <Route path="docs" element={<Docs />} />  Moved to public */}
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Navigate to="profile" />} />
                  <Route path="audit" element={<div className="p-8">Audit Logs (Coming Soon)</div>} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
