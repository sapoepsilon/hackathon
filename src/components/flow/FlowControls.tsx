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
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button size="lg" className="w-[160px]" onClick={onAddNode}>
          <Plus className="mr-2 h-4 w-4" />
          Add Node
        </Button>
        <Button size="lg" className="w-[160px]" onClick={onAddCombiner}>
          Add Combiner
        </Button>
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
