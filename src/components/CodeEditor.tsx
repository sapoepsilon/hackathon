'use client';

import Editor from '@monaco-editor/react';
import { Card, CardContent } from '@/components/ui/card';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ code, onChange }: CodeEditorProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <Editor
          height="75vh"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => onChange(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
      </CardContent>
    </Card>
  );
}
