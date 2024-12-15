import { Button } from "../ui/button";
import { Plus, Group } from "lucide-react";
import { useState } from "react";
import { useFlowContext } from "./FlowProvider";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

interface FlowControlsProps {
  onAddNode: () => void;
  onAddCombiner: () => void;
  onAddJson: () => void;
  onExecuteFlow: () => void;
  isExecuting: boolean;
}

export const FlowControls = ({
  onAddNode,
  onAddCombiner,
  onAddJson,
  onExecuteFlow,
  isExecuting,
}: FlowControlsProps) => {
  const [groupName, setGroupName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { nodes, createGroupFromSelection } = useFlowContext();
  
  const selectedNodes = nodes.filter((node) => node.selected);
  
  const handleCreateGroup = () => {
    if (groupName.trim()) {
      createGroupFromSelection(groupName);
      setGroupName("");
      setIsDialogOpen(false);
    }
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
              <Button onClick={handleCreateGroup}>
                Create Group
              </Button>
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
      </div>
    </>
  );
};
