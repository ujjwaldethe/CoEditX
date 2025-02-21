import { Routes, Route } from "react-router-dom";
import Editor from "./pages/Editor";
import Login from "./pages/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/editor/:roomId" element={<Editor />} />
    </Routes>
  );
}

export default App;
