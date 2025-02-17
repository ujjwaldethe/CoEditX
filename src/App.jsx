import { Routes, Route } from "react-router-dom";
import Editor from "./pages/Editor";
import Login from "./pages/Login";
import CodeEditor from "./pages/CodeEditor";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/editor/:roomId" element={<Editor />} />
      <Route path="/code-editor" element={<CodeEditor />} />
    </Routes>
  );
}

export default App;
