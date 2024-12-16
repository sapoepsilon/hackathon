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

export function CodeEditor({
  code,
  onChange,
  isStreaming = false,
}: CodeEditorProps) {
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

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      // Format the code when it changes
      editor.getAction("editor.action.formatDocument")?.run();
    }
  }, [code]);

  const cleanCode = (input: string): string => {
    if (!input) return "";

    // Remove markdown code block syntax with any language specification
    let cleaned = input.replace(/^```[\w-]*\n|```$/gm, "");

    // Remove any escaped newlines
    cleaned = cleaned.replace(/\\n/g, "\n");

    // Remove any markdown escape characters
    cleaned = cleaned.replace(/\\([`*_{}[\]()#+\-.!])/g, "$1");

    // Normalize line endings
    cleaned = cleaned.replace(/\r\n/g, "\n");

    // Remove any trailing/leading whitespace
    cleaned = cleaned.trim();

    return cleaned;
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="h-full w-full">
      <Card
        className={cn(
          "h-full transition-all duration-200",
          isDarkMode ? "border-zinc-800" : "border-zinc-200"
        )}
      >
        <div className="h-full w-full relative">
          {isStreaming && (
            <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground px-2 py-1 rounded text-sm animate-pulse">
              Generating...
            </div>
          )}
          <Editor
            height="100%"
            defaultLanguage="typescript"
            theme={isDarkMode ? "vs-dark" : "light"}
            value={cleanCode(code)}
            onChange={(value) => onChange(value || "")}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              formatOnPaste: true,
              formatOnType: true,
              automaticLayout: true,
              wordWrap: "on",
              readOnly: isStreaming,
              cursorStyle: isStreaming ? "line" : "block",
              cursorBlinking: isStreaming ? "smooth" : "blink",
              cursorWidth: isStreaming ? 2 : 1,
              smoothScrolling: true,
              scrollbar: {
                vertical: "visible",
                horizontal: "visible",
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
            }}
          />
        </div>
      </Card>
    </div>
  );
}
