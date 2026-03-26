import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Login from "./pages/LogIn";
import Register from "./pages/Register";
import RegisterWithOTP from "./pages/RegisterWithOTP";
import DashboardPage from "./pages/DashboardPage";

import ContestListPage from "./pages/ContestListPage";
import ContestDetailsPage from "./pages/ContestDetailsPage";
import ContestEditorPage from "./pages/ContestEditorPage";
import LeaderboardPage from "./pages/LeaderboardPage";

import ProblemsPage from "./pages/ProblemsPage";
import ProblemDetailPage from "./pages/ProblemDetailPage";
import ProblemEditorPage from "./pages/ProblemEditorPage";

import ProtectedRoute from "./components/ProtectedRoute";

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
      <Route path="/problems/:id" element={<ProblemDetailPage />} />
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
    </Routes>
  );
}

export default App;