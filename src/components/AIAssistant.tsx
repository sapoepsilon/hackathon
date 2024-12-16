"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { apiKeyStorage } from "@/lib/apiKeyStorage";
import { ApiKeyDialog } from "./flow/ApiKeyDialog";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "./ui/textarea";
import { DialogTitle } from "@radix-ui/react-dialog";

interface AIAssistantProps {
  code: string;
  onUpdateCode?: (newCode: string) => void;
  onStreamStart?: () => void;
  onStreamEnd?: () => void;
  isEnabled: boolean;
}

// Local storage keys
const SYSTEM_PROMPT_KEY = "ai-assistant-system-prompt";
const VISIBILITY_KEY = "ai-assistant-visible";
const DISPLAY_MODE_KEY = "ai-assistant-display-mode";

type DisplayMode = "floating" | "side-panel";

export function AIAssistant({
  code,
  onUpdateCode,
  onStreamStart,
  onStreamEnd,
  isEnabled,
}: AIAssistantProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(
    () => localStorage.getItem(SYSTEM_PROMPT_KEY) || ""
  );
  const [isVisible, setIsVisible] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(
    () => (localStorage.getItem(DISPLAY_MODE_KEY) as DisplayMode) || "floating"
  );
  const [isSystemPromptDialogOpen, setIsSystemPromptDialogOpen] = useState(false);
  const [tempSystemPrompt, setTempSystemPrompt] = useState("");
  const { toast } = useToast();
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  useEffect(() => {
    if (isEnabled) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isEnabled]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "k" && isEnabled) {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEnabled]);

  useEffect(() => {
    localStorage.setItem(SYSTEM_PROMPT_KEY, systemPrompt);
  }, [systemPrompt]);

  useEffect(() => {
    localStorage.setItem(VISIBILITY_KEY, String(isVisible));
  }, [isVisible]);

  useEffect(() => {
    localStorage.setItem(DISPLAY_MODE_KEY, displayMode);
  }, [displayMode]);

  const processPrompt = async (prompt: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          systemPrompt: systemPrompt,
          apiKey: apiKeyStorage.retrieve(),
        }),
      });

      if (response.status === 401) {
        apiKeyStorage.remove();
        setPendingPrompt(prompt);
        setIsApiKeyDialogOpen(true);
        return;
      }

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
      onUpdateCode?.(
        `// Error occurred while generating code:\n// ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentPrompt = input;
    setInput("");
    setIsLoading(true);
    onStreamStart?.();

    try {
      // Check for API key first
      if (!apiKeyStorage.retrieve()) {
        setPendingPrompt(currentPrompt);
        setIsApiKeyDialogOpen(true);
        return;
      }

      await processPrompt(currentPrompt);
    } finally {
      setIsLoading(false);
      onStreamEnd?.();
    }
  };

  const handleApiKeySubmit = async () => {
    setIsApiKeyDialogOpen(false);
    if (pendingPrompt) {
      const prompt = pendingPrompt;
      setPendingPrompt(null);
      setIsLoading(true);
      onStreamStart?.();
      try {
        await processPrompt(prompt);
      } finally {
        setIsLoading(false);
        onStreamEnd?.();
      }
    }
  };

  const handleSystemPromptEdit = () => {
    setTempSystemPrompt(systemPrompt);
    setIsSystemPromptDialogOpen(true);
  };

  const handleSystemPromptSave = () => {
    setSystemPrompt(tempSystemPrompt);
    setIsSystemPromptDialogOpen(false);
  };

  if (!isEnabled) {
    return null;
  }

  const toggleDisplayMode = () => {
    setDisplayMode((prev) => (prev === "floating" ? "side-panel" : "floating"));
  };


  return (
    <>
      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent>
          <DialogTitle>Enter OpenAI API Key</DialogTitle>
          <ApiKeyDialog
            onApiKeySubmit={(apiKey) => {
              apiKeyStorage.store(apiKey);
              setIsApiKeyDialogOpen(false);
              if (pendingPrompt) {
                processPrompt(pendingPrompt);
                setPendingPrompt(null);
              }
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isSystemPromptDialogOpen} onOpenChange={setIsSystemPromptDialogOpen}>
        <DialogContent>
          <DialogTitle>Edit System Prompt</DialogTitle>
          <div className="space-y-4">
            <Textarea
              value={tempSystemPrompt}
              onChange={(e) => setTempSystemPrompt(e.target.value)}
              placeholder="Enter system prompt..."
              className="min-h-[200px]"
            />
            <div className="flex justify-end">
              <Button onClick={handleSystemPromptSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isVisible && (
        <div className={displayMode === "floating" ? "fixed bottom-4 right-4 w-96" : "w-full h-full"}>
          <div className="bg-background border rounded-lg shadow-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={handleSystemPromptEdit}>
                Edit System Prompt
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDisplayMode}
                >
                  {displayMode === "floating" ? "Switch to Side Panel" : "Switch to Floating"}
                </Button>
              </div>
            </div>
            <div className="border-t">
              <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto p-4">
                {/* Chat messages will go here */}
              </div>
              <div className="flex items-center gap-2 border-t p-4">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about your code..."
                  className="min-h-[60px] flex-1 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button 
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  onClick={handleSubmit}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
