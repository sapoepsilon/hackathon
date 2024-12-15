import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeEditor } from "@/components/CodeEditor";
import FlowCanvas from "./FlowCanvas";

interface EditorTabsProps {
  code: string;
  onCodeChange: (code: string) => void;
}

export function EditorTabs({ code, onCodeChange }: EditorTabsProps) {
  return (
    <Tabs defaultValue="code" className="w-200px">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="code">Code Editor</TabsTrigger>
        <TabsTrigger value="flow">Flow Canvas</TabsTrigger>
      </TabsList>
      <TabsContent value="code">
        <div>
          <CodeEditor code={code} onChange={onCodeChange} />
        </div>
      </TabsContent>
      <TabsContent value="flow">
        <div className="container mx-auto py-10">
          <FlowCanvas height="75vh" width="100%" />
        </div>
      </TabsContent>
    </Tabs>
  );
}
