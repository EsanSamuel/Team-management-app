"use client";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/actions/user.service";
import {
  Activity,
  ArrowBigDownDash,
  ArrowBigUpDash,
  ChevronUp,
  Plus,
} from "lucide-react";
import Image from "next/image";
import React, { CSSProperties, useEffect, useState } from "react";
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
  create_Project,
  getWorkSpaceProjects,
} from "@/lib/actions/project.service";
import DashboardCard from "./DashboardCard";
import { Card } from "./ui/card";
import { Member, Project, Task, User } from "@/lib/generated/prisma";
import { getAllTasksInWorkspace } from "@/lib/actions/task.service";
import { authorizeRole, getMembers } from "@/lib/actions/member.service";
import { toast } from "sonner";
import { useWorkspace } from "@/context/workspaceContext";
import { ClipLoader, FadeLoader } from "react-spinners";
import { useRouter } from "next/navigation";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const DashboardPage = ({
  workspaceId,
  user,
}: {
  workspaceId: string;
  user: User;
}) => {
  const router = useRouter();
  const [project, setProject] = useState({
    emoji: "",
    name: "",
    description: "",
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [projects, setProjects] = useState<(Project & { user: User })[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { loader } = useWorkspace();

  const create_workspace_project = async () => {
    try {
      const new_project = await create_Project({ ...project, workspaceId });
      toast.success("Project has been created!");
      console.log(new_project);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getWorkSpaceProjects(workspaceId as string).then(setProjects);
    getAllTasksInWorkspace(workspaceId as string).then(setTasks);
    getMembers(workspaceId as string).then(setMembers as any);
  }, [workspaceId]);

  useEffect(() => {
    if (
      workspaceId &&
      user?.id &&
      members.length > 0 &&
      !members.some((member) => member.userId === user.id)
    ) {
      toast.message("You are not a member of this workspace!");
      router.push(`/dashboard`);
    }
  }, [router, workspaceId, members, user.id]);

  const getDoneTaskCount = tasks.filter(
    (task) => task.Status === "Done"
  ).length;

  const getAssignedTasksCount = tasks.filter(
    (task) => task.assigneeId === user.id
  ).length;

  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.id && workspaceId) {
        const result = await authorizeRole(user?.id, workspaceId, [
          "ADMIN",
          "OWNER",
        ]);
        setIsAdmin(result as boolean);
      }
    };

    checkAdmin();
  }, [user?.id, workspaceId]);

  return (
    <div className="py-5 xl:px-10 md:px-10 px-3 sm:px-2">
      <div className="flex xl:justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="font-semibold text-[16px]">Workspace Overview</h1>
          <p className="text-gray-500 text-[12px]">
            Here&apos;s an overview for this workspace!
          </p>
        </div>

        {isAdmin && (
          <Dialog>
            <form>
              <DialogTrigger asChild>
                <Button className="xl:w- w-full mt-3 items-center flex">
                  <div className="">
                    <Plus className="size-3" />
                  </div>
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Project</DialogTitle>
                  <DialogDescription className="text-[12px]">
                    Organize and manage tasks, resources, and team collaboration
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
      </div>

      <>
        {projects.length !== 0 ? (
          <>
            <div className="overflow-x-auto overflow-hidden">
              <div className="grid grid-cols-4 gap-3 min-w-[900px] w-max xl:w-full mt-7">
                <Card className="p-4 border-dashed shadow-none">
                  <div className="flex justify-between text-[13px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Total Projects{" "}
                      <span className="text-green-400 flex items-center gap-1">
                        <ChevronUp size={13} /> {projects.length}
                      </span>
                    </span>
                    <Activity size={14} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mt-1 dark:text-gray-100">
                    {projects.length}
                  </h2>
                </Card>
                <Card className="p-4 border-dashed shadow-none">
                  <div className="flex justify-between text-[13px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Total Tasks{" "}
                      <span className="text-green-400 flex items-center gap-1">
                        <ChevronUp size={13} /> {tasks.length}
                      </span>
                    </span>
                    <Activity size={14} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mt-1 dark:text-gray-100">
                    {tasks.length}
                  </h2>
                </Card>
                <Card className="p-4 border-dashed shadow-none">
                  <div className="flex justify-between text-[13px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Assigned Tasks{" "}
                      <span className="text-green-400 flex items-center gap-1">
                        <ChevronUp size={13} /> {getAssignedTasksCount}
                      </span>
                    </span>
                    <Activity size={14} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mt-1 dark:text-gray-100">
                    {getAssignedTasksCount}
                  </h2>
                </Card>
                <Card className="p-4 border-dashed shadow-none">
                  <div className="flex justify-between text-[13px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Completed Tasks{" "}
                      <span className="text-green-400 flex items-center gap-1 dark:text-gray-100">
                        <ChevronUp size={13} /> {getDoneTaskCount}
                      </span>
                    </span>
                    <Activity size={14} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mt-1 dark:text-gray-100">
                    {getDoneTaskCount}
                  </h2>
                </Card>
              </div>
            </div>

            <div className="mt-5">
              <DashboardCard workspaceProjects={projects as any} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full mt-20  ">
            {" "}
            <h1 className="text-center mt-10 text-gray-600">No Projects</h1>
          </div>
        )}
      </>
    </div>
  );
};

export default DashboardPage;
