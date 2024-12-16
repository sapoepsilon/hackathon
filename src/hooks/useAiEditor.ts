import { useState } from 'react';
import { apiKeyStorage } from '@/lib/apiKeyStorage';
import { useToast } from '@/hooks/use-toast';

interface UseAiEditorResult {
  generateCode: (prompt: string) => Promise<string | null>;
  isLoading: boolean;
  needsApiKey: boolean;
  setNeedsApiKey: (value: boolean) => void;
}

export const useAiEditor = (): UseAiEditorResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const { toast } = useToast();

  const generateCode = async (prompt: string): Promise<string | null> => {
    const apiKey = apiKeyStorage.retrieve();
    
    if (!apiKey) {
      setNeedsApiKey(true);
      return null;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          apiKey,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Invalid or expired API key
          apiKeyStorage.remove();
          setNeedsApiKey(true);
          toast({
            title: "Invalid API Key",
            description: "Please check your OpenAI API key and try again.",
            variant: "destructive",
          });
          return null;
        }
        throw new Error('Failed to generate code');
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('AI Editor error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateCode,
    isLoading,
    needsApiKey,
    setNeedsApiKey,
  };
};
