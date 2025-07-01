"use client";
import Karban from "@/components/Karban";
import TaskCard from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createTask, getAllTasksInWorkspace } from "@/lib/actions/task.service";
import { Member, Project, Task, User } from "@/lib/generated/prisma";
import { CirclePlus, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getMembers } from "@/lib/actions/member.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getWorkSpaceProjects } from "@/lib/actions/project.service";
import { toast } from "sonner";
import { notificationWhenAssignedTask } from "@/lib/actions/notification.service";
import { getUser } from "@/lib/actions/user.service";
import { Badge } from "@/components/ui/badge";

const Page = () => {
  const { workspaceId } = useParams();
  const [tasks, setTasks] = useState<
    (Task & { assignee: User } & { project: Project })[]
  >([]);
  const [task, setTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    Status: "",
    priority: "",
    Duedate: "",
    projectId: "",
  });
  const [view, setView] = useState("Table");
  const [members, setMembers] = useState<(Member & { user: User })[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching workspace data for:", workspaceId);

        const [tasks, members, projects, user] = await Promise.all([
          getAllTasksInWorkspace(workspaceId as string),
          getMembers(workspaceId as string),
          getWorkSpaceProjects(workspaceId as string),
          getUser(),
        ]);

        setProjects(projects as any);
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

  const create_Task = async () => {
    try {
      const create_task = await createTask({ ...task, workspaceId });
      toast.success("Task created!");
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

  return (
    <div className="xl:p-10 md:p-10 p-3">
      <div className="flex xl:justify-between md:justify-between flex-col md:flex-row">
        <div className="flex flex-col mb-5">
          <h1 className="font-semibold text-[16px]">Tasks</h1>
          <p className="text-gray-500 text-[12px]">
            View all tasks in this workspace!
          </p>
        </div>
        {!isLoading && (
          <Dialog>
            <form className="overflow-y-auto">
              <DialogTrigger asChild>
                <Button className="xl:w- w-full items-center">
                  <Plus className="size-3" />
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
                    <Label>Project</Label>
                    <Select
                      onValueChange={(value) =>
                        setTask({ ...task, projectId: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {projects?.map((project) => (
                          <SelectItem
                            key={project.id}
                            value={project.id}
                            className="w-full"
                          >
                            <div className="flex items-center gap-2">
                              <Badge
                                className="h-5 min-w-5 rounded-10 px-1 justify-center bg-sidebar-primary
                               text-center flex items-center dark:bg-white dark:text-black"
                              >
                                {project?.name[0]}
                              </Badge>{" "}
                              <h1 className="text-[12px]">{project.name}</h1>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

      <Separator />

      {!isLoading ? (
        <>
          {tasks.length !== 0 && !isLoading ? (
            <>
              {view === "Table" && (
                <TaskCard
                  tasks={tasks}
                  workspaceId={workspaceId as any}
                  setView={setView}
                />
              )}
              {view === "Karban" && (
                <Karban
                  tasks={tasks as any}
                  workspaceId={workspaceId as any}
                  setView={setView}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full mt-20  ">
              {" "}
              <h1 className="text-center sm:mt-10  mt-5 text-gray-600 dark:text-gray-400">
                No Tasks yet!
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
