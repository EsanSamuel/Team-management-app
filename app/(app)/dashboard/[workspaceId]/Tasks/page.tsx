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

const page = () => {
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

  useEffect(() => {
    getAllTasksInWorkspace(workspaceId as string).then(setTasks);
    getMembers(workspaceId as string).then(setMembers as any);
    getWorkSpaceProjects(workspaceId as string).then(setProjects);
  }, []);

  const create_Task = async () => {
    await createTask({ ...task, workspaceId });
    toast.success("Task created!");
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
        <Dialog>
          <form className="overflow-y-auto">
            <DialogTrigger asChild>
              <Button className="xl:w- w-full">
                <Plus className="size-3 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
                <DialogDescription className="text-sm">
                  Organize and manage tasks
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Task title</Label>
                  <Input
                    autoFocus
                    id="title"
                    placeholder="Enter task title"
                    onChange={(e) =>
                      setTask({ ...task, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    placeholder="Describe the task"
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
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {projects?.map((project) => (
                        <SelectItem
                          key={project.id}
                          value={project.id}
                          className="w-full"
                        >
                          <div className="flex items-center gap-2">
                            {project.emoji}
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
                      <SelectValue placeholder="Select a member" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {members.map((member) => (
                        <SelectItem key={member.user.id} value={member.user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={member.user.profilePicture!} />
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
                      <SelectValue placeholder="Select status" />
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
                      <SelectValue placeholder="Select priority" />
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
      </div>

      <Separator />

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
    </div>
  );
};

export default page;
