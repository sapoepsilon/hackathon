import { Button } from "../ui/button";
import { Plus } from "lucide-react";

interface FlowControlsProps {
  onAddNode: () => void;
  onAddCombiner: () => void;
  onExecuteFlow: () => void;
  isExecuting: boolean;
}

export const FlowControls = ({
  onAddNode,
  onAddCombiner,
  onExecuteFlow,
  isExecuting,
}: FlowControlsProps) => {
  return (
    <>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button size="sm" onClick={onAddNode}>
          <Plus className="mr-2 h-4 w-4" />
          Add Node
        </Button>
        <Button onClick={onAddCombiner}>
          Add Combiner
        </Button>
      </div>
      <div className="absolute bottom-4 right-4 z-10">
        <Button 
          onClick={onExecuteFlow}
          disabled={isExecuting}
          size="lg"
        >
          {isExecuting ? "Executing..." : "Execute Flow"}
        </Button>
      </div>
    </>
  );
};
