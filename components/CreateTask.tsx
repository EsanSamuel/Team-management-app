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
import { Input } from "./ui/input";
import { Member, Project, Task, User } from "@/lib/generated/prisma";
import { createTask, getAllTasksInWorkspace } from "@/lib/actions/task.service";
import { getMembers } from "@/lib/actions/member.service";
import { getWorkSpaceProjects } from "@/lib/actions/project.service";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

const CreateTask = ({
  workspaceId,
  status,
}: {
  workspaceId: string;
  status: string;
}) => {
  const [tasks, setTasks] = useState<
    (Task & { assignee: User } & { project: Project })[]
  >([]);
  const [task, setTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
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
    await createTask({ ...task, workspaceId, Status: status });
    toast.success("Task created!");
  };
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create Task in "{status}"</DialogTitle>
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
            onChange={(e) => setTask({ ...task, title: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            placeholder="Describe the task"
            onChange={(e) => setTask({ ...task, description: e.target.value })}
          />
        </div>

        <div className="grid gap-2 w-full">
          <Label>Project</Label>
          <Select
            onValueChange={(value) => setTask({ ...task, projectId: value })}
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
            onValueChange={(value) => setTask({ ...task, assignedTo: value })}
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
                      <AvatarFallback>{member.user.username[0]}</AvatarFallback>
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
            onChange={(e) => setTask({ ...task, Duedate: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Priority</Label>
          <Select
            onValueChange={(value) => setTask({ ...task, priority: value })}
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
  );
};

export default CreateTask;
