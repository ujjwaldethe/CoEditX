import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const initialPythonCode = `# Function to add two numbers
def add_numbers(num1, num2):
    return num1 + num2

# Input from user
number1 = int(input("Enter the first number: "))
number2 = int(input("Enter the second number: "))

# Perform addition and display the result
result = add_numbers(number1, number2)
print(f"The sum of {number1} and {number2} is {result}")`;

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
  const [userInput, setUserInput] = useState("");
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
  const navigate = useNavigate();

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
      } else if (data.type === "input_update") {
        setUserInput(data.content);
      }
    };
    return () => {
      wsRef.current.close();
    };
  }, []);

  // Handle language change and update sample code for Python
  useEffect(() => {
    if (language.language === "python") {
      // Check if there's already a Python file in the file tree
      const pythonFileExists = findFileByExtension(fileTree, ".py");
      
      if (!pythonFileExists) {
        // Create a new Python file if one doesn't exist
        const newFileTree = {
          ...fileTree,
          children: [
            ...fileTree.children,
            {
              type: "file",
              name: "main.py",
              path: "/main.py",
              content: initialPythonCode,
            },
          ],
        };
        
        setFileTree(newFileTree);
        
        // Set the Python file as active
        const pythonFile = {
          path: "/main.py",
          content: initialPythonCode,
        };
        
        setActiveFile(pythonFile);
      } else if (activeFile.path.endsWith('.py')) {
        // If a Python file is active, do nothing
      } else {
        // If a Python file exists but is not active, set it as active
        const pythonFile = findFileByExtension(fileTree, ".py");
        if (pythonFile) {
          setActiveFile(pythonFile);
        }
      }
    }
  }, [language]);

  const findFileByExtension = (node, extension) => {
    if (node.type === "file" && node.path.endsWith(extension)) {
      return node;
    }

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const file = findFileByExtension(child, extension);
        if (file) return file;
      }
    }

    return null;
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  async function runCode() {
    setIsRunningCode(true);
    const code = editorRef.current.getValue();
    
    try {
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
          stdin: userInput, // Include user input for all languages
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
              message: output,
            })
          );
        }
      } else {
        setOutput("Error: Failed to execute code");
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "output",
              message: "Error: Failed to execute code",
            })
          );
        }
      }
    } catch (error) {
      console.error("Error executing code:", error);
      setOutput(`Error: ${error.message || "Failed to execute code"}`);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "output",
            message: `Error: ${error.message || "Failed to execute code"}`,
          })
        );
      }
    } finally {
      setIsRunningCode(false);
    }
  }

  const handleInputChange = (e) => {
    const newInput = e.target.value;
    setUserInput(newInput);
    
    // Send input update to WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "input_update",
          content: newInput,
        })
      );
    }
  };

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

  async function validateUser() {
    const response = await axios.post(
      `${import.meta.env.VITE_API_ENDPOINT}/validate-user`,
      {
        room_id: roomId,
        email: localStorage.getItem("code-editor-user-email") || "",
      }
    );
    if (response.status === 200) {
      const message = response.data?.message || "";
      if (message === "User is approved") {
        return true;
      }
    }
    return false;
  }

  useEffect(() => {
    let interval;
    interval = setInterval(async () => {
      const isValidated = await validateUser();
      if (!isValidated) {
        navigate("/");
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to get input placeholder text based on language
  const getInputPlaceholder = () => {
    switch (language.language) {
      case 'python':
        return "Enter input values here, each on a new line...";
      case 'java':
        return "Enter input for System.in, each on a new line...";
      case 'javascript':
        return "Enter input for process.stdin, each on a new line...";
      case 'cpp':
      case 'c':
        return "Enter input for stdin, each on a new line...";
      default:
        return "Enter program input, each on a new line...";
    }
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

        <div className="max-h-screen flex-1 grid grid-cols-10">
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
            className={`flex flex-col max-h-screen ${
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

            {/* Input section for all languages */}
            <div className={`border-t ${colors.border} ${colors.background}`}>
              <div
                className={`px-4 py-2 text-sm ${
                  isDark ? "bg-[#252526]" : "bg-gray-100"
                }`}
              >
                Input
              </div>
              <div className="p-2">
                <textarea
                  className={`w-full h-24 p-2 ${
                    isDark ? "bg-[#1e1e1e] text-gray-300" : "bg-white text-gray-800"
                  } border ${
                    isDark ? "border-gray-700" : "border-gray-300"
                  } rounded text-sm font-mono`}
                  placeholder={getInputPlaceholder()}
                  value={userInput}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Output Console */}
            <div
              className={`h-64 border-t ${colors.border} ${colors.background} overflow-y-auto`}
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