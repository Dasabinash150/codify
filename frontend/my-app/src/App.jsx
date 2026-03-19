// import { Routes, Route } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import ContestList from "./pages/ContestList";
import EditorPage from "./pages/EditorPage";
import ContestDetails from "./pages/ContestDetails";
import Login from "./pages/LogIn";
import Register from "./pages/Register";
import Leaderboard from "./pages/LeaderBoard";
import ProtectedRoute from "./components/ProtectedRoute";

import RegisterWithOTP from "./pages/RegisterWithOTP";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/contest/:id/leaderboard" element={<Leaderboard />} />

      {/* Protected routes */}
      <Route
        path="/contests"
        element={
          <ProtectedRoute>
            <ContestList />
          </ProtectedRoute>
        }
      />

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
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        }
      />


      <Route path="/registerotp" element={<RegisterWithOTP />} />

     
    </Routes>
  );
}

export default App;


// // src/App.jsx
// import { Routes, Route } from "react-router-dom";
// import Homepage from "./pages/Homepage";
// import ContestList from "./pages/ContestList";
// import EditorPage from "./pages/EditorPage";
// import ContestDetails from "./pages/ContestDetails";
// import Login from "./pages/LogIn";
// import Register from "./pages/Register";
// import Leaderboard from "./pages/LeaderBoard";

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Homepage />} />
//       <Route path="/contests" element={<ContestList />} />
//       <Route path="/contest/:id" element={<ContestDetails />} />
//       <Route path="/contest/:id/editor" element={<EditorPage />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/contest/:id/leaderboard" element={<Leaderboard />} /> 
//     </Routes>
//   );
// }

// export default App;
