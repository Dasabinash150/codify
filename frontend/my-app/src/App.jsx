import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Login from "./pages/LogIn";
import Register from "./pages/Register";
import RegisterWithOTP from "./pages/RegisterWithOTP";
import DashboardPage from "./pages/DashboardPage";
import SubmissionsPage from "./pages/SubmissionsPage";

import ContestListPage from "./pages/ContestListPage";
import ContestDetailsPage from "./pages/ContestDetailsPage";
import ContestEditorPage from "./pages/ContestEditorPage";
import LeaderboardPage from "./pages/LeaderboardPage";

import ProblemsPage from "./pages/ProblemsPage";
import ProblemEditorPage from "./pages/ProblemEditorPage";

import ProtectedRoute from "./components/ProtectedRoute";

import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/registerotp" element={<RegisterWithOTP />} />

      {/* Problem Routes */}
      <Route path="/problems" element={<ProblemsPage />} />
      <Route
        path="/problems/:id/editor"
        element={
          <ProtectedRoute>
            <ProblemEditorPage />
          </ProtectedRoute>
        }
      />

      {/* Contest Routes */}
      <Route path="/contests" element={<ContestListPage />} />
      <Route
        path="/contest/:id"
        element={
          <ProtectedRoute>
            <ContestDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contest/:id/problem/:problemId"
        element={
          <ProtectedRoute>
            <ContestEditorPage />
          </ProtectedRoute>
        }
      />
      <Route path="/contest/:id/leaderboard" element={<LeaderboardPage />} />

      {/* User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/submissions"
        element={
          <ProtectedRoute>
            <SubmissionsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;