// import { Routes, Route } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";

// import ContestList from "./pages/ContestList";
import ContestPage from "./pages/ContestPage";
import EditorPage from "./pages/EditorPage";
import ContestDetails from "./pages/ContestDetails";
import Login from "./pages/LogIn";
import Register from "./pages/Register";
import Leaderboard from "./pages/LeaderBoard";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";

import ContestListPage from "./pages/ContestListPage";
import ContestDetailsPage from "./pages/ContestDetailsPage";
import ContestEditorPage from "./pages/ContestEditorPage";

import ProblemsPage from "./pages/ProblemsPage";
import ProblemDetailPage from "./pages/ProblemDetailPage";
import ProblemEditorPage from "./pages/ProblemEditorPage";






import RegisterWithOTP from "./pages/RegisterWithOTP";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/problems" element={<ProblemsPage />} />
      <Route path="/problems/:id" element={<ProblemDetailPage />} />
      <Route path="/contest/:id/leaderboard" element={<LeaderboardPage />} />
      <Route path="/contest/" element={<ContestPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/contests" element={<ContestListPage />} />
      <Route path="/contest/:id" element={<ContestDetailsPage />} />
      <Route path="/contest/:id/problem/:problemId" element={<ContestEditorPage />} />
      <Route path="/problems" element={<ProblemsPage />} />
      <Route path="/problems/:id" element={<ProblemDetailPage />} />
      <Route path="/problems/:id/editor" element={<ProblemEditorPage />} />

      {/* Protected routes */}
      {/* <Route
        path="/contests"
        element={
            <ContestList />

        }
      /> */}

      <Route
        path="/contest/:id"
        element={
          <ProtectedRoute>
            <ContestDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/contest/:id/editor"
        element={

          <EditorPage />
        }
      />


      <Route path="/registerotp" element={<RegisterWithOTP />} />


    </Routes>
  );
}

export default App;


