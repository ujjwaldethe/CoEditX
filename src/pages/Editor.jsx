import { useState, useRef, useEffect } from "react";
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
import axios from "axios";

const initialCode = `public class Main {
    public static void main(String[] args) {
        sayHi();
    }

    // Method to print "Hello world"
    public static void sayHi() {
        System.out.println("Hello world!");
    }
}
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
  const wsRef = useRef(null);
  const [wsOutput, setWsOutput] = useState("")
  
  const [language, setLanguage] = useState({
    label: "Java",
    language: "java",
    version: "15.0.2",
  });
  const [theme, setTheme] = useState("vs-dark");
  const [font, setFont] = useState("Fira Code");
  const [fontSize, setFontSize] = useState(14);
  const [activePanel, setActivePanel] = useState("none");



  const languagesWithConfig = [
    {
      label: "Java",
      language: "java",
      version: "15.0.2",
    },
    {
      label: "Python",
      language: "python",
      version: "3.10.8",
    }
  ];

  const pathSegments = window.location.pathname.split('/');
  const roomId = pathSegments[pathSegments.length - 1];
  // Create a ref to hold the WebSocket conne
  useEffect(() => {
    // Connect to WebSocket
    wsRef.current = new WebSocket(`ws://localhost:8000/ws/${roomId}`);

    wsRef.current.onopen = () => {
      console.info('Connected to collaborative session');
    };

    wsRef.current.onclose = () => {
      console.warn('Disconnected from collaborative session');
      // Optionally, implement reconnection logic
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'content_update') {
        setActiveFile((prev) => ({ ...prev, content: data.content }));
      } else if (data.type === 'output') {
        setWsOutput(data.message);
      }
    };
    return () => {
      wsRef.current.close();
    };
  }, []);


  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  async function runCode() {
    const code = editorRef.current.getValue();
    console.log(language);
    const codeResponse = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      {
        language: language.language,
        version: language.version,
        files: [
          {
            content: code,
          },
        ],
      }
    );
    const result = codeResponse.data;
    if (result.run) {
      const output = [
        result.run.output ? `Output: ${result.run.output}` : "",
        result.run.stderr ? `Error: ${result.run.stderr}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      setOutput(output);
       // Send output to WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'output',
        message: output, // Send the output message to the WebSocket server
      }));
    }
    } else {
      setOutput("Error: Failed to execute code");
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'output',
          message: errorMessage, // Send the error message to the WebSocket server
        }));
      }
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

    // Send the updated content to the WebSocket server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'content_update',
        content: value,
      }));
    }
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
                className={`hover:bg-[#2d2d2d] rounded-lg p-3 ${activePanel === "files" ? "bg-[#2d2d2d]" : ""}`}
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
                className={`hover:bg-[#2d2d2d] rounded-lg p-3 ${activePanel === "settings" ? "bg-[#2d2d2d]" : ""}`}
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
            <button className="p-3 hover:bg-[#2d2d2d] rounded-lg" title="Download">
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
                  languages={languagesWithConfig}
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
          <div className={`flex flex-col ${activePanel === "none" ? "col-span-6" : "col-span-5"}`}>
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
                language={language.language}
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
            <div className="h-32 bg-[#1e1e1e] border-t border-gray-800 overflow-y-auto">
              <div className="bg-[#252526] px-4 py-2 text-sm">Output</div>
              <div className="p-4 text-sm font-mono whitespace-pre-wrap">
                {output || "// Run your code to see output here"}
                {wsOutput && <div>{wsOutput}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}