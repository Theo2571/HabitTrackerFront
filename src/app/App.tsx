import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './providers';
import { ProtectedRoute } from '../shared/ui/ProtectedRoute';
import { LoginPage } from '../pages/login';
import { RegisterPage } from '../pages/register';
import { TasksPage } from '../pages/tasks';
import { ProfilePage } from '../pages/profile';
import '../shared/styles/index.css';

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;

