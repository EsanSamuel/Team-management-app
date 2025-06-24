"use client";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Calendar,
  ChevronUp,
  CircleCheckBig,
  CirclePlus,
  Command,
  Frame,
  GalleryVerticalEnd,
  Home,
  Inbox,
  LayoutDashboard,
  PieChart,
  Search,
  Settings,
  Settings2,
  SquareTerminal,
  User2,
  Users,
  Zap,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./workspace-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Member, Project, User, Workspace } from "@/lib/generated/prisma";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { redirect, usePathname, useRouter } from "next/navigation";
import { Separator } from "./ui/separator";
import React, { useEffect, useState } from "react";
import {
  create_Project,
  getWorkSpaceProjects,
} from "@/lib/actions/project.service";
import { useWorkspace } from "@/context/workspaceContext";
import { create_workspace } from "@/lib/actions/workspace.service";
import { FieldValues, useForm } from "react-hook-form";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "./ui/dropdown-menu";

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
import {
  AddUserToWorkspace,
  authorizeRole,
} from "@/lib/actions/member.service";
import useLocalStorage from "@/hooks/useLocalStorage";
import Link from "next/link";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";

interface IProps {
  user: User;
  workspace: Workspace[] & { Member: Member };
}

export function AppSidebar({ user, workspace }: IProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [workspaceId, setWorkspaceId] = useState("");
  const [workspaceProjects, setWorkspaceProjects] = useState<Project[]>([]);
  const { isMobile } = useSidebar();
  const [activeWorkspace, setActiveWorkspace] = useLocalStorage(
    "workspace",
    workspace[0]
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [workspaceprops, setWorkspace] = React.useState({
    name: "",
    description: "",
  });
  const [project, setProject] = useState({
    emoji: "",
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

  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.id && activeWorkspace?.id) {
        const result = await authorizeRole(user?.id, activeWorkspace?.id, [
          "ADMIN",
          "OWNER",
        ]);
        setIsAdmin(result as boolean);
      }
    };

    checkAdmin();
  }, [user?.id, activeWorkspace?.id]);

  useEffect(() => {
    if (pathname.includes("/")) {
      const [, , workspaceId] = pathname.split("/");
      setWorkspaceId(workspaceId);
    }
  }, [pathname]);

  useEffect(() => {
    const getProjects = async () => {
      if (activeWorkspace?.id) {
        const projects = await getWorkSpaceProjects(activeWorkspace.id);
        setWorkspaceProjects(projects as any[]);
      }
    };
    getProjects();
  }, [activeWorkspace?.id]);

  // ✅ Only now do the conditional return
  if (!activeWorkspace) {
    return null;
  }

  // Menu items.
  const items = [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboard,
    },
    {
      title: "Tasks",
      url: "/Tasks",
      icon: CircleCheckBig,
    },
    {
      title: "Members",
      url: "/members",
      icon: Users,
    },
    isAdmin && {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ].filter(Boolean) as {
    title: string;
    url: string;
    icon: React.ElementType;
  }[];

  const createWorkspace = async () => {
    try {
      const new_workspace = await create_workspace({ ...workspaceprops });
      toast.success("Workspace has been created!");
      console.log(new_workspace);
      if (new_workspace) {
        const member = await AddUserToWorkspace(new_workspace.id, "OWNER");
        console.log(member);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const navigateToWorkspace = (workspace: Workspace[], index: number) => {
    setActiveWorkspace(workspace[index] as any);
    router.push(`/dashboard/${workspace[index].id}`);
  };
  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  const create_workspace_project = async () => {
    try {
      const new_project = await create_Project({
        ...project,
        workspaceId: activeWorkspace?.id,
      });
      console.log(new_project);
      toast.success("Project created!");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <button className="bg-black text-white rounded-full p-1">
                  <Zap />
                </button>{" "}
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/*workspace*/}
        <SidebarGroup>
          <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        {/*<GalleryVerticalEnd className="size-4" />*/}
                        {activeWorkspace.name[0]}
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {activeWorkspace.name}
                        </span>
                        <span className="truncate text-xs text-gray-600">
                          Free
                        </span>
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
                      Workspaces
                    </DropdownMenuLabel>
                    {workspace.map((team, index) => (
                      <DropdownMenuItem
                        key={team.name}
                        onClick={() => navigateToWorkspace(workspace, index)}
                        className="gap-2 p-2"
                      >
                        <div className="flex size-6 items-center justify-center rounded-md border">
                          {/*<GalleryVerticalEnd className="size-3.5 shrink-0" /> */}
                          {team.name[0]}
                        </div>
                        {team.name}
                        <DropdownMenuShortcut>
                          ⌘{index + 1}
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />

                    <Dialog>
                      <form onSubmit={handleSubmit(createWorkspace)}>
                        <div className="">
                          <DialogTrigger className="flex gap-2 p-2 items-center">
                            <div className="flex size-6 items-center justify-center rounded-md bg-transparent">
                              <Plus className="size-4" />
                            </div>
                            <div className="text-muted-foreground text-sm font-medium">
                              Create workspace
                            </div>
                          </DialogTrigger>
                        </div>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>
                              Let&apos;s build a workspace
                            </DialogTitle>
                            <DialogDescription className="text-[12px]">
                              Boost your productivity by making it easier foor
                              everyone to access projects in one direction.
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
                              <Label
                                htmlFor="username-1"
                                className="text-[12px]"
                              >
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
                              Get your members onboard with a few words about
                              your workspace
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
            <Separator />
          </SidebarGroupContent>
        </SidebarGroup>

        {/*workspace*/}
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="text-[13px] text-gray-600"
                  >
                    <Link href={`/dashboard/${activeWorkspace.id}/${item.url}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/*Projects */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-between items-center">
            Projects{" "}
            {isAdmin && (
              <Dialog>
                <form>
                  <DialogTrigger asChild>
                    <CirclePlus size={13} className="text-gray-500" />
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create Project</DialogTitle>
                      <DialogDescription className="text-[12px]">
                        Organize and manage tasks, resources, and team
                        collaboration
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="name-1" className="text-[12px]">
                          Project Emoji
                        </Label>
                        <Input
                          id="name-1"
                          name="name"
                          onChange={(e) =>
                            setProject((prev) => ({
                              ...prev,
                              emoji: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="name-1" className="text-[12px]">
                          Project title
                        </Label>
                        <Input
                          id="name-1"
                          name="name"
                          onChange={(e) =>
                            setProject((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="username-1" className="text-[12px]">
                          Project description
                        </Label>
                        <Textarea
                          onChange={(e) =>
                            setProject((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" onClick={create_workspace_project}>
                        Create
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceProjects?.map((item) => (
                <SidebarMenuItem
                  key={item.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/${activeWorkspace.id}/project/${item.id}`
                    )
                  }
                >
                  <SidebarMenuButton
                    asChild
                    className="text-[13px] text-gray-600"
                  >
                    <Link
                      href={`/dashboard/${activeWorkspace.id}/project/${item.id}`}
                    >
                      <p>{item?.emoji}</p>
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar>
                    <AvatarImage src={user?.profilePicture!} />
                    <AvatarFallback>{user?.username[0]}</AvatarFallback>
                  </Avatar>
                  {user?.username}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <span className="text-red-400">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
