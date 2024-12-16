import { Button } from "../ui/button";
import { Plus, Group, Bot } from "lucide-react";
import { useState, useEffect } from "react";
import { useFlowContext } from "./FlowProvider";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ApiKeyDialog } from "./ApiKeyDialog";
import { apiKeyStorage } from "@/lib/apiKeyStorage";
import { useToast } from "@/hooks/use-toast";
import { useAiEditor } from "@/hooks/useAiEditor";

interface FlowControlsProps {
  onAddNode: () => void;
  onAddCombiner: () => void;
  onAddJson: () => void;
  onExecuteFlow: () => void;
  onSaveFlow: () => void;
  onLoadFlow: () => void;
  isExecuting: boolean;
}

export const FlowControls = ({
  onAddNode,
  onAddCombiner,
  onAddJson,
  onExecuteFlow,
  onSaveFlow,
  onLoadFlow,
  isExecuting,
}: FlowControlsProps) => {
  const [groupName, setGroupName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const { nodes, createGroupFromSelection } = useFlowContext();
  const { toast } = useToast();
  const { generateCode, isLoading, needsApiKey, setNeedsApiKey } = useAiEditor();

  const selectedNodes = nodes.filter((node) => node.selected);

  useEffect(() => {
    if (needsApiKey) {
      setIsApiKeyDialogOpen(true);
    }
  }, [needsApiKey]);

  const handleCreateGroup = () => {
    if (groupName.trim()) {
      createGroupFromSelection(groupName);
      setGroupName("");
      setIsDialogOpen(false);
    }
  };

  const handleAiEditorClick = async () => {
    const code = await generateCode("Create a TypeScript function that adds two numbers");
    if (code) {
      toast({
        title: "Code Generated",
        description: "AI has generated the code successfully.",
      });
      // TODO: Insert the generated code into the editor
    }
  };

  const handleApiKeySubmit = () => {
    setNeedsApiKey(false);
    setIsApiKeyDialogOpen(false);
    toast({
      title: "API Key Stored",
      description: "You can now use the AI editor functionality.",
    });
    // Try again after key is stored
    handleAiEditorClick();
  };

  return (
    <>
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button size="lg" className="w-[160px]" onClick={onAddNode}>
          <Plus className="mr-2 h-4 w-4" />
          Add Node
        </Button>
        <Button size="lg" className="w-[160px]" onClick={onAddCombiner}>
          Add Combiner
        </Button>
        <Button size="lg" className="w-[160px]" onClick={onAddJson}>
          Add JSON
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="w-[160px]"
              disabled={selectedNodes.length < 2}
            >
              <Group className="mr-2 h-4 w-4" />
              Group Nodes
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Node Group</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <Button onClick={handleCreateGroup}>Create Group</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          size="lg"
          className="w-[160px]"
          onClick={onExecuteFlow}
          disabled={isExecuting}
        >
          {isExecuting ? "Executing..." : "Execute Flow"}
        </Button>
        <Button size="lg" className="w-[160px]" onClick={onSaveFlow}>
          Save Flow
        </Button>
        <Button size="lg" className="w-[160px]" onClick={onLoadFlow}>
          Load Flow
        </Button>

        <Button
          size="lg"
          className="w-[160px]"
          variant="secondary"
          onClick={handleAiEditorClick}
          disabled={isLoading}
        >
          <Bot className="mr-2 h-4 w-4" />
          {isLoading ? "Generating..." : "AI Editor"}
        </Button>
      </div>

      <ApiKeyDialog
        isOpen={isApiKeyDialogOpen}
        onOpenChange={(open) => {
          setIsApiKeyDialogOpen(open);
          if (!open) {
            setNeedsApiKey(false);
          }
        }}
        onApiKeySubmit={handleApiKeySubmit}
      />
    </>
  );
};
