import React, { useState, useRef } from "react";
import { FolderClosed, User, Play, Search, Download } from "lucide-react";
import Editor from "@monaco-editor/react";

const initialCode = `function sayHi() {
  console.log("Hello world");
}

// Write your code here
`;

function CodeEditor() {
  const [files, setFiles] = useState([
    { name: "index.js", type: "js", content: initialCode, active: true },
  ]);
  const [output, setOutput] = useState("");
  const editorRef = useRef(null);
  const [theme, setTheme] = useState("vs-dark");

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const runCode = () => {
    const code = editorRef.current.getValue();
    try {
      // Create a new function from the code and execute it
      const fn = new Function(code);
      // Capture console.log output
      const originalLog = console.log;
      let output = [];
      console.log = (...args) => {
        output.push(args.join(" "));
      };

      fn();

      // Restore console.log
      console.log = originalLog;
      setOutput(output.join("\n"));
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const addNewFile = () => {
    const newFile = {
      name: `file${files.length + 1}.js`,
      type: "js",
      content: "// Write your code here\n",
      active: false,
    };
    setFiles([...files, newFile]);
  };

  const switchFile = (index) => {
    setFiles(
      files.map((file, i) => ({
        ...file,
        active: i === index,
      }))
    );
  };

  const activeFile = files.find((file) => file.active) || files[0];

  const handleEditorChange = (value) => {
    setFiles(
      files.map((file) => (file.active ? { ...file, content: value } : file))
    );
  };

  return (
    <div className="h-screen bg-[#1e1e1e] text-gray-300 flex">
      {/* Sidebar */}
      <div className="w-16 bg-[#252526] flex flex-col items-center py-4 border-r border-gray-800">
        <div className="mb-8">
          <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white">
            C
          </div>
        </div>
        <button
          className="p-3 hover:bg-[#2d2d2d] rounded-lg mb-4"
          onClick={addNewFile}
        >
          <FolderClosed className="w-5 h-5" />
        </button>
        <button className="p-3 hover:bg-[#2d2d2d] rounded-lg mb-4">
          <Search className="w-5 h-5" />
        </button>
        <button
          className="p-3 hover:bg-[#2d2d2d] rounded-lg mb-4"
          onClick={runCode}
        >
          <Play className="w-5 h-5" />
        </button>
        <div className="mt-auto">
          <button className="p-3 hover:bg-[#2d2d2d] rounded-lg mb-4">
            <Download className="w-5 h-5" />
          </button>
          <button className="p-3 hover:bg-[#2d2d2d] rounded-lg">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* File Explorer */}
      <div className="w-64 bg-[#252526] p-4 border-r border-gray-800">
        <h2 className="text-sm font-semibold mb-4 text-gray-400">FILES</h2>
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 p-2 hover:bg-[#2d2d2d] rounded cursor-pointer ${
                file.active ? "bg-[#2d2d2d]" : ""
              }`}
              onClick={() => switchFile(index)}
            >
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>{file.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Tab Bar */}
        <div className="h-9 bg-[#252526] flex items-center px-4 border-b border-gray-800">
          {files.map((file, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 px-3 py-1 rounded-t cursor-pointer mr-2 ${
                file.active ? "bg-[#1e1e1e]" : "hover:bg-[#2d2d2d]"
              }`}
              onClick={() => switchFile(index)}
            >
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-sm">{file.name}</span>
            </div>
          ))}
        </div>

        {/* Editor Content */}
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme={theme}
            value={activeFile.content}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              lineNumbers: "on",
              folding: true,
              foldingHighlight: true,
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>

        {/* Output Panel */}
        <div className="h-32 bg-[#1e1e1e] border-t border-gray-800">
          <div className="bg-[#252526] px-4 py-2 text-sm">Output</div>
          <div className="p-4 text-sm font-mono whitespace-pre-wrap">
            {output || "// Run your code to see output here"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeEditor;
