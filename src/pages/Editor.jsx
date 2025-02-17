import { useState, useRef } from "react";
import {
  FolderClosed,
  User,
  Play,
  Download,
  Settings as SettingsIcon,
  File,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import FileExplorer from "@/components/FileExplorer";
import Settings from "@/components/Settings";

const initialCode = `function sayHi() {
  console.log("Hello world");
}
sayHi();

// Write your code here
`;

export default function CodeEditor() {
  const [fileTree, setFileTree] = useState({
    type: "folder",
    name: "root",
    path: "/",
    isOpen: true,
    children: [
      {
        type: "file",
        name: "index.js",
        path: "/index.js",
        content: initialCode,
      },
    ],
  });
  const [activeFile, setActiveFile] = useState({
    path: "/index.js",
    content: initialCode,
  });
  const [output, setOutput] = useState("");
  const editorRef = useRef(null);

  // Editor settings state
  const [activePanel, setActivePanel] = useState("files"); // "none", "files", "settings"
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [font, setFont] = useState("Fira Code");
  const [fontSize, setFontSize] = useState(14);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  function runCode() {
    const code = editorRef.current.getValue();
    try {
      const fn = new Function(code);
      const originalLog = console.log;
      let output = [];
      console.log = (...args) => {
        output.push(args.join(" "));
      };

      fn();
      console.log = originalLog;
      setOutput(output.join("\n"));
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  }

  const handleEditorChange = (value) => {
    setActiveFile((prev) => ({ ...prev, content: value }));

    const updateTree = (tree) => {
      if (tree.path === activeFile.path) {
        return { ...tree, content: value };
      }
      if (tree.children) {
        return {
          ...tree,
          children: tree.children.map((child) => updateTree(child)),
        };
      }
      return tree;
    };

    setFileTree(updateTree(fileTree));
  };

  const togglePanel = (panelName) => {
    setActivePanel((prev) => (prev === panelName ? "none" : panelName));
  };

  return (
    <TooltipProvider>
      <div className="h-screen bg-[#1e1e1e] text-gray-300 flex max-w-screen">
        {/* Sidebar */}
        <div className="w-16 p-3 bg-[#252526] flex flex-col items-center gap-3 pt-4 border-r border-gray-800">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`hover:bg-[#2d2d2d] rounded-lg p-3 ${
                  activePanel === "files" ? "bg-[#2d2d2d]" : ""
                }`}
                onClick={() => togglePanel("files")}
              >
                <FolderClosed className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>File Explorer</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="hover:bg-[#2d2d2d] rounded-lg p-3"
                onClick={runCode}
              >
                <Play className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Run Code</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`hover:bg-[#2d2d2d] rounded-lg p-3 ${
                  activePanel === "settings" ? "bg-[#2d2d2d]" : ""
                }`}
                onClick={() => togglePanel("settings")}
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
          <div className="mt-auto">
            <button
              className="p-3 hover:bg-[#2d2d2d] rounded-lg"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button className="p-3 hover:bg-[#2d2d2d] rounded-lg" title="User">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-6">
          {activePanel !== "none" && (
            <div className="col-span-1">
              {activePanel === "files" && (
                <FileExplorer
                  fileTree={fileTree}
                  setFileTree={setFileTree}
                  activeFile={activeFile}
                  setActiveFile={setActiveFile}
                />
              )}
              {activePanel === "settings" && (
                <Settings
                  language={language}
                  setLanguage={setLanguage}
                  theme={theme}
                  setTheme={setTheme}
                  font={font}
                  setFont={setFont}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                />
              )}
            </div>
          )}

          {/* Main Editor Area */}
          <div
            className={`flex flex-col ${
              activePanel === "none" ? "col-span-6" : "col-span-5"
            }`}
          >
            {/* Tab Bar */}
            <div className="h-9 bg-[#252526] flex items-center px-4 border-b border-gray-800">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-t cursor-pointer mr-2 bg-[#1e1e1e]">
                <File className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{activeFile?.name}</span>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1">
              <Editor
                height="100%"
                language={language}
                theme={theme}
                value={activeFile?.content}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: fontSize,
                  fontFamily: font,
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

            {/* Output Console */}
            <div className="h-32 bg-[#1e1e1e] border-t border-gray-800">
              <div className="bg-[#252526] px-4 py-2 text-sm">Output</div>
              <div className="p-4 text-sm font-mono whitespace-pre-wrap">
                {output || "// Run your code to see output here"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
