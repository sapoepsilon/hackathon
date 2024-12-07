"use client";

import Editor from "@monaco-editor/react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ code, onChange }: CodeEditorProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  return (
    <Card>
      <CardContent className="p-4">
        <Editor
          height="75vh"
          defaultLanguage="javascript"
          theme={isDarkMode ? "vs-dark" : "vs-light"}
          value={code}
          onChange={(value) => onChange(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
      </CardContent>
    </Card>
  );
}
