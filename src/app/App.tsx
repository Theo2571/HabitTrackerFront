import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './providers';
import { ProtectedRoute } from '../shared/ui/ProtectedRoute';
import { DashboardLayout } from '../shared/ui/DashboardLayout';
import { LoginPage } from '../pages/login';
import { RegisterPage } from '../pages/register';
import { DashboardPage } from '../pages/dashboard';
import { TasksPage } from '../pages/tasks';
import { ProfilePage } from '../pages/profile';
import '../shared/styles/index.css';

function App() {
  return (
    <QueryProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TasksPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </QueryProvider>
  );
}

export default App;
