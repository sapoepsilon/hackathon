import { Button } from "@/components/ui/button";
import { IconDocker } from "@/components/icons";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { SheetTrigger } from "@/components/ui/sheet";

interface NavigationProps {
  deploymentStatus: string;
  onDeploy: () => void;
}

export function Navigation({ deploymentStatus, onDeploy }: NavigationProps) {
  return (
    <NavigationMenu className="p-2">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-background hover:bg-accent">
            Menu
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-2">
            <SheetTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <div className="flex items-center gap-2">
                  <IconDocker className="h-4 w-4" />
                  View Containers
                </div>
              </Button>
            </SheetTrigger>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-background hover:bg-accent">
            Deploy
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={onDeploy}
            >
              {deploymentStatus === "deploying" ? "Deploying..." : "Deploy"}
            </Button>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
