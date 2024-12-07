"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { onUpdateCode, onStreamStart, onStreamEnd } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
  onUpdateCode?: (newCode: string) => void;
  onStreamStart?: () => void;
  onStreamEnd?: () => void;
}

export function AIAssistant({ onUpdateCode, onStreamStart, onStreamEnd }: AIAssistantProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setInput("");
    setIsLoading(true);
    onStreamStart?.();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedCode = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedCode += chunk;
        
        if (onUpdateCode) {
          onUpdateCode(accumulatedCode);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      // Show error in the code editor
      onUpdateCode?.(`// Error occurred while generating code:\n// ${error.message}`);
    } finally {
      setIsLoading(false);
      onStreamEnd?.();
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the code you want to generate..."
            className="flex-1 resize-none rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"} + Enter to generate code
        </p>
      </form>
    </div>
  );
}
