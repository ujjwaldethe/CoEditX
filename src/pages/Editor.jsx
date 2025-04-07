import { useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import {
  FolderClosed,
  Play,
  Download,
  Settings as SettingsIcon,
  File,
  MessageSquare,
  Users,
  MonitorUp,
  RefreshCw,
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
import Chat from "@/components/Chat";
import Participants from "../components/Participants";

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
        name: "index.java",
        path: "/index.java",
        content: initialCode,
      },
    ],
  });
  const [activeFile, setActiveFile] = useState({
    path: "/index.java",
    content: initialCode,
  });
  const [output, setOutput] = useState("");
  const editorRef = useRef(null);
  const wsRef = useRef(null);
  const fileInputRef = useRef(null);

  const [language, setLanguage] = useState({
    label: "Java",
    language: "java",
    version: "15.0.2",
  });
  const [theme, setTheme] = useState("vs-dark");
  const [font, setFont] = useState("Fira Code");
  const [fontSize, setFontSize] = useState(14);
  const [activePanel, setActivePanel] = useState("files"); // "none", "files", "settings"
  const [engagementPanel, setEngagementPanel] = useState("none"); // "none", "chat", "participants"
  const [isRunningCode, setIsRunningCode] = useState(false);

  const isDark = theme === "vs-dark" || theme === "hc-black";

  const colors = {
    background: isDark ? "bg-[#1e1e1e]" : "bg-white",
    border: isDark ? "border-gray-800" : "border-gray-200",
    hover: isDark ? "hover:bg-[#2d2d2d]" : "hover:bg-gray-200",
    active: isDark ? "bg-[#2d2d2d]" : "bg-gray-200",
  };

  const languagesWithConfig = [
    {
      label: "Java",
      language: "java",
      version: "15.0.2",
    },
    {
      label: "Python",
      language: "python",
      version: "3.10.0",
    },
    {
      label: "JavaScript",
      language: "javascript",
      version: "18.15.0",
    },
    {
      label: "C++",
      language: "cpp",
      version: "10.2.0",
    },
    {
      label: "C",
      language: "c",
      version: "10.2.0",
    },
  ];

  const pathSegments = window.location.pathname.split("/");
  const roomId = pathSegments[pathSegments.length - 1];

  useEffect(() => {
    // Connect to WebSocket
    wsRef.current = new WebSocket(`ws://localhost:8000/ws/${roomId}`);

    wsRef.current.onopen = () => {
      console.info("Connected to collaborative session");
    };

    wsRef.current.onclose = () => {
      console.warn("Disconnected from collaborative session");
      // Optionally, implement reconnection logic
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "content_update") {
        setActiveFile((prev) => ({ ...prev, content: data.content }));
      } else if (data.type === "output") {
        setOutput(data.message);
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
    setIsRunningCode(true);
    const code = editorRef.current.getValue();
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
        wsRef.current.send(
          JSON.stringify({
            type: "output",
            message: output, // Send the output message to the WebSocket server
          })
        );
      }
    } else {
      setOutput("Error: Failed to execute code");
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "output",
            message: "Error: Failed to execute code", // Send the error message to the WebSocket server
          })
        );
      }
    }
    setIsRunningCode(false);
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
      wsRef.current.send(
        JSON.stringify({
          type: "content_update",
          content: value,
        })
      );
    }
  };

  const togglePanel = (panelName) => {
    setActivePanel((prev) => (prev === panelName ? "none" : panelName));
  };

  const toggleEngagementPanel = (panelName) => {
    setEngagementPanel((prev) => (prev === panelName ? "none" : panelName));
  };

  const addToZip = (item, zip, parentPath = "") => {
    const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name;

    if (item.type === "file") {
      zip.file(currentPath, item.content);
    } else if (item.type === "folder") {
      zip.folder(currentPath);
      item.children?.forEach((child) => addToZip(child, zip, currentPath));
    }
  };

  async function handleDownload() {
    const zip = new JSZip();
    addToZip(fileTree, zip);
    const content = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9,
      },
    });
    const url = window.URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = "code-editor.zip";
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  }

  const openLocalFolder = () => {
    fileInputRef.current.click();
  };

  const handleFolderSelection = async (event) => {
    const { files } = event.target;
    if (files.length === 0) return;

    // Get the root folder name from the first file's path
    const rootFolderName = files[0].webkitRelativePath.split("/")[0];

    const newFileTree = {
      type: "folder",
      name: rootFolderName,
      path: "/",
      isOpen: true,
      children: [],
    };

    // Process all selected files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = file.webkitRelativePath;
      const pathParts = filePath.split("/");

      // Skip the first part (root folder name)
      if (pathParts.length <= 1) continue;

      let currentLevel = newFileTree;

      // Create folders in the path if they don't exist
      for (let j = 1; j < pathParts.length - 1; j++) {
        const folderName = pathParts[j];
        const folderPath = "/" + pathParts.slice(1, j + 1).join("/");

        let foundFolder = currentLevel.children.find(
          (child) => child.type === "folder" && child.name === folderName
        );

        if (!foundFolder) {
          foundFolder = {
            type: "folder",
            name: folderName,
            path: folderPath,
            isOpen: true,
            children: [],
          };
          currentLevel.children.push(foundFolder);
        }

        currentLevel = foundFolder;
      }

      // Add the file to the current folder
      const fileName = pathParts[pathParts.length - 1];
      const filePath2 = "/" + pathParts.slice(1).join("/");

      // Read file content
      const fileContent = await readFileContent(file);

      currentLevel.children.push({
        type: "file",
        name: fileName,
        path: filePath2,
        content: fileContent,
      });
    }

    setFileTree(newFileTree);

    // Set the first file as active if there are any files
    const firstFile = findFirstFile(newFileTree);
    if (firstFile) {
      setActiveFile(firstFile);
    }
  };

  // Helper function to read file content
  const readFileContent = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file);
    });
  };

  // Helper function to find the first file in the tree
  const findFirstFile = (node) => {
    if (node.type === "file") {
      return node;
    }

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const file = findFirstFile(child);
        if (file) return file;
      }
    }

    return null;
  };

  return (
    <TooltipProvider>
      <div
        className={`h-screen max-w-screen flex ${
          isDark ? "bg-[#1e1e1e] text-gray-300" : "bg-white text-gray-800"
        }`}
      >
        {/* Hidden file input for folder selection */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          webkitdirectory="true"
          multiple
          onChange={handleFolderSelection}
        />

        {/* Sidebar */}
        <div
          className={`w-16 p-3 flex flex-col items-center gap-3 pt-4 border-r ${
            colors.border
          } ${isDark ? "bg-[#252526]" : "bg-gray-100"}`}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`rounded-lg p-3 ${colors.hover}`}
                onClick={openLocalFolder}
              >
                <MonitorUp className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Local Folder</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`rounded-lg p-3 ${
                  activePanel === "files" ? colors.active : ""
                } ${colors.hover}`}
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
                className={`rounded-lg p-3 ${colors.hover}`}
                onClick={() => toggleEngagementPanel("chat")}
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chat</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              {isRunningCode ? (
                <button
                  disabled
                  className={`rounded-lg p-3 ${colors.hover} cursor-not-allowed`}
                >
                  <RefreshCw className="w-5 h-5 animate-spin" />
                </button>
              ) : (
                <button
                  className={`rounded-lg p-3 ${colors.hover}`}
                  onClick={runCode}
                >
                  <Play className="w-5 h-5" />
                </button>
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>Run Code</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`rounded-lg p-3 ${colors.hover}`}
                onClick={() => toggleEngagementPanel("participants")}
              >
                <Users className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Participants</p>
            </TooltipContent>
          </Tooltip>
          <div className="mt-auto space-y-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`rounded-lg p-3 ${colors.hover}`}
                  onClick={handleDownload}
                >
                  <Download className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`rounded-lg p-3 ${
                    activePanel === "settings" ? colors.active : ""
                  } ${colors.hover}`}
                  onClick={() => togglePanel("settings")}
                >
                  <SettingsIcon className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-10">
          {activePanel !== "none" && (
            <div
              className={`col-span-2 p-4 border-r ${colors.border} ${
                isDark ? "bg-[#252526]" : "bg-gray-100"
              }`}
            >
              {activePanel === "files" && (
                <FileExplorer
                  fileTree={fileTree}
                  setFileTree={setFileTree}
                  activeFile={activeFile}
                  setActiveFile={setActiveFile}
                  theme={theme}
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
          <div
            className={`flex flex-col ${
              activePanel === "none"
                ? engagementPanel !== "none"
                  ? "col-span-7"
                  : "col-span-10"
                : engagementPanel !== "none"
                ? "col-span-5"
                : "col-span-8"
            }`}
          >
            {/* Tab Bar */}
            <div
              className={`h-9 flex items-center px-4 border-b ${
                colors.border
              } ${isDark ? "bg-[#252526]" : "bg-gray-100"}`}
            >
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-t cursor-pointer mr-2 ${colors.background}`}
              >
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
            <div
              className={`h-32 border-t ${colors.border} ${colors.background} overflow-y-auto`}
            >
              <div
                className={`px-4 py-2 text-sm ${
                  isDark ? "bg-[#252526]" : "bg-gray-100"
                }`}
              >
                Output
              </div>
              <div className="p-4 text-sm font-mono whitespace-pre-wrap">
                {isRunningCode ? (
                  <span>Running code...</span>
                ) : (
                  output || "// Run your code to see output here"
                )}
              </div>
            </div>
          </div>

          {/* Chat */}
          {engagementPanel !== "none" && (
            <div className={`col-span-3 border-l ${colors.border}`}>
              {engagementPanel === "chat" && (
                <Chat theme={theme} roomId={roomId} />
              )}
              {engagementPanel === "participants" && (
                <Participants theme={theme} isHost={true} />
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
