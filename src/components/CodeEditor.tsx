"use client";
import Editor from "@monaco-editor/react";
import { Card } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  isStreaming?: boolean;
}

export function CodeEditor({ code, onChange, isStreaming = false }: CodeEditorProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    setIsDarkMode(darkModeMediaQuery.matches);

    const themeChangeHandler = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener("change", themeChangeHandler);
    return () =>
      darkModeMediaQuery.removeEventListener("change", themeChangeHandler);
  }, []);

  useEffect(() => {
    if (isStreaming && editorRef.current) {
      const editor = editorRef.current;
      const model = editor.getModel();
      const lastLine = model.getLineCount();
      const lastColumn = model.getLineMaxColumn(lastLine);
      
      // Set cursor at the end
      editor.setPosition({ lineNumber: lastLine, column: lastColumn });
      editor.revealLineInCenterIfOutsideViewport(lastLine);
    }
  }, [code, isStreaming]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="h-full w-full">
      <Card className={cn("h-full transition-all duration-200", 
        isStreaming && "ring-2 ring-primary ring-opacity-50")}>
        <div className="h-full w-full relative">
          {isStreaming && (
            <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground px-2 py-1 rounded text-sm animate-pulse">
              Generating...
            </div>
          )}
          <Editor
            height="100%"
            defaultLanguage="typescript"
            theme={isDarkMode ? "vs-dark" : "vs-light"}
            value={code}
            onChange={(value) => onChange(value || "")}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              readOnly: isStreaming,
              cursorStyle: isStreaming ? 'line' : 'block',
              cursorBlinking: isStreaming ? 'smooth' : 'blink',
              cursorWidth: isStreaming ? 2 : 1,
              smoothScrolling: true,
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
              wordWrap: 'on'
            }}
          />
        </div>
      </Card>
    </div>
  );
}
