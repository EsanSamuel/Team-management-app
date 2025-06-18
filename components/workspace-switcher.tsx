"use client";
import * as React from "react";
import { ChevronsUpDown, GalleryVerticalEnd, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { create_workspace } from "@/lib/actions/workspace.service";
import { Workspace } from "@/lib/generated/prisma";
import { useRouter } from "next/navigation";

export function TeamSwitcher({ workspace }: { workspace: Workspace[] }) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [activeTeam, setActiveTeam] = React.useState(workspace[0]);
  const [workspaceprops, setWorkspace] = React.useState({
    name: "",
    description: "",
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  if (!activeTeam) {
    return null;
  }

  const createWorkspace = async () => {
    try {
      const new_workspace = await create_workspace({ ...workspaceprops });
      console.log(new_workspace);
    } catch (error) {
      console.log(error);
    }
  };

  const navigateToWorkspace = (workspace: Workspace[], index: number) => {
    setActiveTeam(workspace[index] as any);
    router.push(`/dashboard/${workspace[index].id}`);
  };

  /*React.useEffect(() => {
    router.push(`/dashboard/${workspace[0].id}`);
  }, [router, workspace]);*/

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">Free</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>
            {workspace.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => navigateToWorkspace(workspace, index)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <GalleryVerticalEnd className="size-3.5 shrink-0" />
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />

            <Dialog>
              <form onSubmit={handleSubmit(createWorkspace)}>
                <div className="gap-2 p-2">
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      {" "}
                      <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                        <Plus className="size-4" />
                      </div>
                      <div className="text-muted-foreground font-medium">
                        Create workspace
                      </div>
                    </Button>
                  </DialogTrigger>
                </div>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Let&apos;s build a workspace</DialogTitle>
                    <DialogDescription className="text-[12px]">
                      Boost your productivity by making it easier foor everyone
                      to access projects in one direction.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 mt-4">
                    <div className="grid gap-3">
                      <Label htmlFor="name-1" className="text-[12px]">
                        Workspace name
                      </Label>
                      <Input
                        id="name-1"
                        onChange={(e) =>
                          setWorkspace((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="username-1" className="text-[12px]">
                        Workspace description
                      </Label>
                      <Textarea
                        id="description"
                        onChange={(e) =>
                          setWorkspace((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <DialogDescription className="text-[10px]">
                      Get your members onboard with a few words about your
                      workspace
                    </DialogDescription>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      onClick={createWorkspace}
                    >
                      Create workspace
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </form>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
