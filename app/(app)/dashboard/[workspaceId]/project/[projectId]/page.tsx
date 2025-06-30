"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Activity,
  ArrowBigDownDash,
  ArrowBigUpDash,
  ChevronsUpDown,
  CircleHelp,
  CirclePlus,
  ListChecks,
  Plus,
  User as Person,
  ArrowDownFromLine,
  ArrowRightLeft,
  Pencil,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getProject } from "@/lib/actions/project.service";
import { authorizeRole, getMembers } from "@/lib/actions/member.service";
import { createTask, getTasks } from "@/lib/actions/task.service";
import TaskCard from "@/components/TaskCard";

import { Member, Project, Task, User } from "@/lib/generated/prisma";
import Karban from "@/components/Karban";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getUser } from "@/lib/actions/user.service";
import { toast } from "sonner";
import { notificationWhenAssignedTask } from "@/lib/actions/notification.service";

const Page = () => {
  const { workspaceId, projectId } = useParams();
  const [task, setTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    Status: "",
    priority: "",
    Duedate: "",
  });
  const [project, setProject] = useState<Project | null>();
  const [members, setMembers] = useState<(Member & { user: User })[]>([]);
  const [view, setView] = useState("Table");
  const [tasks, setTasks] = useState<
    (Task & { assignee: User } & { project: Project })[]
  >([]);
  const [user, setUser] = useState<User>();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching workspace data for:", workspaceId);

        const [prorject, members, tasks, user] = await Promise.all([
          getProject(projectId as string),
          getMembers(workspaceId as string),
          getTasks(projectId as string),
          getUser(),
        ]);

        setProject(project);
        setTasks(tasks as any);
        setMembers(members as any);
        setUser(user as any);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (workspaceId) {
      fetchData();
    } else {
      console.warn("workspaceId is not defined yet");
    }
  }, [workspaceId]);

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

  const create_Task = async () => {
    try {
      const create_task = await createTask({
        ...task,
        projectId: projectId as string,
        workspaceId,
      });
      toast.success("Task has been created!");
      if (create_task) {
        const notification = await notificationWhenAssignedTask({
          taskId: create_task.id,
          senderId: user?.id,
          receiverId: create_task.assigneeId,
          content: `You have been assigned a task - "${create_task.title}" - Project: ${create_task.project.name} - Workspace: ${create_task.workspace.name}`,
        });
        if (notification) {
          console.log(
            `New notification: ${notification?.receiver?.username} have been assigned a task - ${create_task.title}`
          );
        }
      }
      window.location.reload();
    } catch (error) {
      toast.error("Task not created!");
    }
  };

  const getDoneTaskCount = tasks.filter(
    (task) => task.Status === "Done"
  ).length;

  const getOverdiewTask =
    tasks.length - tasks.filter((task) => task.Status === "Done").length;

  return (
    <div className="xl:px-10 py-10 md:px-10 px-3">
      <div className="flex xl:justify-between flex-col xl:flex-row w-full mb-6">
        <div className="flex items-center gap-2">
          {/*      <span className="text-xl">{project?.emoji}</span> */}
          <Badge className="h-5 min-w-5 rounded-10 px-1 justify-center bg-sidebar-primary text-center flex items-center dark:bg-white dark:text-black">
            {project?.name[0]}
          </Badge>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex gap-3 items-center">
            {project?.name}{" "}
            <button>
              <Pencil
                size={13}
                onClick={() =>
                  router.push(
                    `/settings/${projectId}?workspaceId=${workspaceId}`
                  )
                }
              />
            </button>
          </h1>
        </div>
        {!isLoading && (
          <Dialog>
            <form className="">
              <DialogTrigger asChild>
                <Button className="xl:w- w-full mt-3 flex items-center">
                  <div className="">
                    <Plus className="size-3" />
                  </div>
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Task</DialogTitle>
                  <DialogDescription className="text-[12px]">
                    Organize and manage tasks
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Task title</Label>
                    <Input
                      autoFocus
                      id="title"
                      onChange={(e) =>
                        setTask({ ...task, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea
                      id="desc"
                      onChange={(e) =>
                        setTask({ ...task, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2 w-full">
                    <Label>Assigned To</Label>
                    <Select
                      onValueChange={(value) =>
                        setTask({ ...task, assignedTo: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {members.map((member) => (
                          <SelectItem
                            key={member.user.id}
                            value={member.user.id}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage
                                  src={member.user.profilePicture!}
                                />
                                <AvatarFallback>
                                  {member.user.username[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span>{member.user.username}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      onChange={(e) =>
                        setTask({ ...task, Duedate: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select
                      onValueChange={(value) =>
                        setTask({ ...task, Status: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Backlog",
                          "Todo",
                          "In Progress",
                          "In Review",
                          "Done",
                        ].map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Priority</Label>
                    <Select
                      onValueChange={(value) =>
                        setTask({ ...task, priority: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Low", "Medium", "High"].map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" onClick={create_Task}>
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>
        )}
      </div>

      {!isLoading ? (
        <>
          <div className="overflow-x-auto overflow-hidden">
            <div className="grid grid-cols-3 min-w-[700px] gap-5 ">
              <Card className="p-4 border-dashed shadow-none">
                <div className="flex justify-between text-sm text-muted-foreground">
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
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    Overdue Tasks{" "}
                    <span className="text-red-400 flex items-center gap-1">
                      <ChevronDown size={13} /> {getOverdiewTask}
                    </span>
                  </span>
                  <Activity size={14} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mt-1 dark:text-gray-100">
                  {getOverdiewTask}
                </h2>
              </Card>
              <Card className="p-4 border-dashed shadow-none">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    Completed Tasks{" "}
                    <span className="text-green-400 flex items-center gap-1">
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
          <Separator className="my-6" />

          {tasks.length !== 0 && !isLoading ? (
            <>
              {view === "Table" && (
                <TaskCard
                  tasks={tasks}
                  workspaceId={workspaceId as any}
                  setView={setView}
                />
              )}

              {view === "Karban" && <Karban tasks={tasks as any} />}
            </>
          ) : (
            <div className="flex items-center justify-center h-full mt-20  ">
              {" "}
              <h1 className="text-center sm:mt-10  mt-5 text-gray-600 dark:text-gray-400">
                No Tasks yet.
              </h1>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full mt-20  ">
          {" "}
          <h1 className="text-center sm:mt-10  mt-5 text-gray-600 dark:text-gray-400">
            Loading...
          </h1>
        </div>
      )}
    </div>
  );
};

export default Page;
