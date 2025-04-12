import { Routes, Route } from "react-router-dom";
import Editor from "./pages/Editor";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/editor/:roomId" element={<Editor />} />
    </Routes>
  );
}

export default App;
