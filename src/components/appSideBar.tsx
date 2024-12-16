import React, { useState } from "react";
import { Code, GitBranch, MenuIcon, Bot } from "lucide-react";
import { IconDocker } from "@/components/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SheetTrigger } from "@/components/ui/sheet";
import {
  DeployDialog,
  DataType,
  InputConfig,
} from "@/components/ui/deploy-dialog";
import { CodeEditor } from "@/components/CodeEditor";
import FlowCanvas from "./FlowCanvas";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { AIAssistant } from "@/components/AIAssistant";
import { Switch } from "./ui/switch";

interface AppSidebarProps {
  code: string;
  onCodeChange: (code: string) => void;
  deploymentStatus: string;
  onDeploy: (
    inputs: InputConfig[],
    output: DataType,
    method: string
  ) => Promise<void>;
}

const AppSidebar = ({
  code,
  onCodeChange,
  deploymentStatus,
  onDeploy,
}: AppSidebarProps) => {
  const [activeView, setActiveView] = useState<"code" | "flow">("code");
  const [isAIAssistantEnabled, setIsAIAssistantEnabled] = useState(false);

  const handleAIAssistantToggle = () => {
    setIsAIAssistantEnabled(!isAIAssistantEnabled);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar collapsible="icon" className="border-r shrink-0">
          <SidebarHeader className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <GitBranch className="h-6 w-6" />
              <span className="font-semibold">Block Builder</span>
            </div>
            <SidebarTrigger className="ml-auto">
              <MenuIcon className="h-4 w-4" />
            </SidebarTrigger>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Views</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveView("code")}
                      isActive={activeView === "code"}
                    >
                      <Code className="h-4 w-4" />
                      <span>Code Editor</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveView("flow")}
                      isActive={activeView === "flow"}
                    >
                      <GitBranch className="h-4 w-4" />
                      <span>Flow Canvas</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <div className="flex items-center justify-between px-2 py-1">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <span>AI Assistant</span>
                      </div>
                      <Switch
                        checked={isAIAssistantEnabled}
                        onCheckedChange={handleAIAssistantToggle}
                      />
                    </div>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SheetTrigger asChild>
                      <SidebarMenuButton>
                        <IconDocker className="h-4 w-4" />
                        <span>Containers</span>
                      </SidebarMenuButton>
                    </SheetTrigger>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <DeployDialog
                      onDeploy={onDeploy}
                      trigger={
                        <SidebarMenuButton
                          disabled={deploymentStatus === "deploying"}
                        >
                          <span>
                            {deploymentStatus === "deploying"
                              ? "Deploying..."
                              : "Deploy"}
                          </span>
                        </SidebarMenuButton>
                      }
                    />
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={75}>
              <div className="h-full">
                {activeView === "code" ? (
                  <CodeEditor code={code} onChange={onCodeChange} />
                ) : (
                  <FlowCanvas />
                )}
              </div>
            </ResizablePanel>
            {isAIAssistantEnabled && (
              <>
                <ResizableHandle />
                <ResizablePanel defaultSize={25}>
                  <AIAssistant
                    code={code}
                    onUpdateCode={onCodeChange}
                    isEnabled={isAIAssistantEnabled}
                  />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppSidebar;
