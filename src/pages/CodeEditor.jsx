import React, { useState } from 'react';
import Editor from "@monaco-editor/react";

const CodeEditor = () => {
  // Language configurations with correct versions for Piston API
  const LANGUAGE_CONFIGS = {
    python: {
      label: "Python",
      version: "3.10.0",
      template: 'print("Hello World!")'
    },
    javascript: {
      label: "JavaScript",
      version: "18.15.0",
      template: 'console.log("Hello World!");'
    },
    java: {
      label: "Java",
      version: "15.0.2",
      template: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}`
    },
    cpp: {
      label: "C++",
      version: "10.2.0",
      template: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello World!" << endl;
    return 0;
}`
    },
    c: {
      label: "C",
      version: "10.2.0",
      template: `#include <stdio.h>

int main() {
    printf("Hello World!\\n");
    return 0;
}`
    }
  };

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(LANGUAGE_CONFIGS.python.template);
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    setCode(LANGUAGE_CONFIGS[newLanguage].template);
    setOutput("");
  };

  const executeCode = async () => {
    setIsLoading(true);
    setOutput("Executing code...");

    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          language: language,
          version: LANGUAGE_CONFIGS[language].version,
          files: [{
            content: code
          }]
        }),
      });
      
      const result = await response.json();
      
      if (result.run) {
        const output = [
          result.run.output ? `Output: ${result.run.output}` : '',
          result.run.stderr ? `Error: ${result.run.stderr}` : ''
        ].filter(Boolean).join('\n');
        
        setOutput(output || 'No output');
      } else {
        setOutput('Error: Failed to execute code');
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px" }}>
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        padding: "20px"
      }}>
        <h1 style={{ marginBottom: "20px" }}>Code Editor</h1>
        
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          marginBottom: "20px"
        }}>
          <select 
            value={language} 
            onChange={handleLanguageChange}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc"
            }}
          >
            {Object.entries(LANGUAGE_CONFIGS).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
          
          <button 
            onClick={executeCode} 
            disabled={isLoading}
            style={{
              padding: "8px 16px",
              backgroundColor: isLoading ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isLoading ? "default" : "pointer"
            }}
          >
            {isLoading ? 'Running...' : 'Run Code'}
          </button>
        </div>

        <div style={{ border: "1px solid #ccc", borderRadius: "4px" }}>
          <Editor
            height="400px"
            language={language}
            value={code}
            onChange={setCode}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: "on"
            }}
          />
        </div>

        {output && (
          <div style={{ 
            marginTop: "20px",
            padding: "16px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
            border: "1px solid #eee"
          }}>
            <pre style={{ 
              margin: 0,
              whiteSpace: "pre-wrap",
              maxHeight: "200px",
              overflow: "auto"
            }}>
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;