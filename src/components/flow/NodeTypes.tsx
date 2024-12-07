import { Handle, Position } from "@xyflow/react";
import { Button } from "../ui/button";

interface ApiNodeData {
  id: string;
  type: string;
  label: string;
  containerId: string;
  deploymentUrl: string;
  method: string;
  inputs?: Array<{ id: string; type: string }>;
  outputType?: string;
  inputValues?: Record<string, any>;
  output?: any;
}

interface ApiNodeProps {
  id: string;
  data: ApiNodeData;
  isExecuting: boolean;
  onExecute: (id: string) => void;
}

export const ApiNode = ({ id, data, isExecuting, onExecute }: ApiNodeProps) => {
  console.log('ApiNode props:', { id, data, isExecuting }); // Debug log
  
  const handleExecute = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Execute clicked for node:', id); // Debug log
    onExecute(id);
  };

  return (
    <div className="relative p-4 shadow-lg rounded-lg bg-background border border-border min-w-[280px] max-w-[400px]">
      <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
        <div className="font-bold text-sm truncate">{data.label}</div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleExecute}
          disabled={isExecuting}
          className="shrink-0"
        >
          {isExecuting ? 'Running...' : 'Run'}
        </Button>
      </div>
      
      {/* Input handles */}
      <div className="absolute -left-3 top-0 bottom-0 flex flex-col justify-around">
        {data.inputs?.map((input) => (
          <div key={input.id} className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground whitespace-nowrap bg-background/80 px-1.5 py-0.5 rounded">
              in: {input.type}
            </div>
            <Handle
              type="target"
              position={Position.Left}
              id={input.id}
              className="!w-3 !h-3"
              style={{ background: 'var(--border)' }}
            />
          </div>
        ))}
      </div>
      
      {/* Output handle */}
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-[1]">
        <div className="text-xs text-muted-foreground whitespace-nowrap bg-background/80 px-1.5 py-0.5 rounded">
          out: {data.outputType}
        </div>
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="!w-3 !h-3"
          style={{ background: 'var(--border)' }}
        />
      </div>

      {/* Display input values if any */}
      {data.inputValues && Object.entries(data.inputValues).length > 0 && (
        <div className="mt-4 text-xs space-y-1">
          <div className="font-semibold text-foreground/80">Inputs:</div>
          <div className="space-y-1 bg-muted/30 rounded-md p-2">
            {Object.entries(data.inputValues).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <span className="font-medium text-foreground/70">{key}:</span>
                <span className="text-foreground/60 break-all">{JSON.stringify(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display output if any */}
      {data.output && (
        <div className="mt-4 text-xs space-y-1">
          <div className="font-semibold text-foreground/80">Output:</div>
          <pre className="bg-muted p-2 rounded-md overflow-x-auto max-h-[200px] scrollbar-thin scrollbar-thumb-border scrollbar-track-background">
            {JSON.stringify(data.output, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

interface CombinerNodeProps {
  data: any;
}

export const CombinerNode = ({ data }: CombinerNodeProps) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
    <div className="font-bold">JSON Combiner</div>
    <Handle 
      type="target" 
      position={Position.Left} 
      id="input1" 
      style={{ top: '40%' }}
    />
    <Handle 
      type="target" 
      position={Position.Left} 
      id="input2" 
      style={{ top: '60%' }}
    />
    <div className="text-sm mt-2 max-w-[200px] overflow-hidden text-ellipsis">
      {data.combined ? (
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(data.combined, null, 2)}
        </pre>
      ) : (
        'Connect two inputs'
      )}
    </div>
    <Handle 
      type="source" 
      position={Position.Right} 
      id="output"
      data-type="json"
    />
  </div>
);
