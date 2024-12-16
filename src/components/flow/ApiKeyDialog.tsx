import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { apiKeyStorage } from "@/lib/apiKeyStorage";
import { Label } from "../ui/label";

interface ApiKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySubmit: () => void;
}

export const ApiKeyDialog = ({
  isOpen,
  onOpenChange,
  onApiKeySubmit,
}: ApiKeyDialogProps) => {
  const [apiKey, setApiKey] = useState("");
  const [expirationHours, setExpirationHours] = useState("24");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      setError("API key is required");
      return;
    }

    const hours = parseInt(expirationHours);
    if (isNaN(hours) || hours <= 0) {
      setError("Please enter a valid expiration time");
      return;
    }

    try {
      apiKeyStorage.store(apiKey, hours);
      setApiKey("");
      setError("");
      onOpenChange(false);
      onApiKeySubmit();
    } catch (err) {
      setError("Failed to store API key");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter API Key</DialogTitle>
          <DialogDescription>
            Your API key will be securely stored and will expire after the specified time.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError("");
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiration">Expiration (hours)</Label>
            <Input
              id="expiration"
              type="number"
              min="1"
              placeholder="24"
              value={expirationHours}
              onChange={(e) => {
                setExpirationHours(e.target.value);
                setError("");
              }}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
