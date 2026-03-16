// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import ContestList from "./pages/ContestList";
import EditorPage from "./pages/EditorPage";
import ContestDetails from "./pages/ContestDetails";
import Login from "./pages/LogIn";
import Register from "./pages/Register";
import Leaderboard from "./pages/LeaderBoard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/contests" element={<ContestList />} />
      <Route path="/contest/:id" element={<ContestDetails />} />
      <Route path="/contest/:id/editor" element={<EditorPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/contest/:id/leaderboard" element={<Leaderboard />} /> 
    </Routes>
  );
}

export default App;
