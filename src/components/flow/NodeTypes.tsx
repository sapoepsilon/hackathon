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
    <div className="relative px-4 py-2 shadow-lg rounded-md bg-background border border-border">
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-sm">{data.label}</div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleExecute}
          disabled={isExecuting}
        >
          Run
        </Button>
      </div>
      
      {/* Input handles */}
      <div className="absolute -left-2 top-0 bottom-0 flex flex-col justify-around">
        {data.inputs?.map((input) => (
          <div key={input.id} className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">in: {input.type}</div>
            <Handle
              type="target"
              position={Position.Left}
              id={input.id}
              style={{ background: '#555' }}
            />
          </div>
        ))}
      </div>
      
      {/* Output handle */}
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <div className="text-xs text-muted-foreground">out: {data.outputType}</div>
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          style={{ background: '#555' }}
        />
      </div>

      {/* Display input values if any */}
      {data.inputValues && Object.entries(data.inputValues).length > 0 && (
        <div className="mt-2 text-xs">
          <div className="font-semibold">Inputs:</div>
          {Object.entries(data.inputValues).map(([key, value]) => (
            <div key={key} className="ml-2">
              {key}: {JSON.stringify(value)}
            </div>
          ))}
        </div>
      )}

      {/* Display output if any */}
      {data.output && (
        <div className="mt-2 text-xs">
          <div className="font-semibold">Output:</div>
          <div className="ml-2 max-w-[200px] overflow-hidden">
            <pre className="bg-secondary/50 p-2 rounded">
              {JSON.stringify(data.output, null, 2)}
            </pre>
          </div>
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
