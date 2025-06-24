"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { editTask, getTask } from "@/lib/actions/task.service";
import { getWorkSpaceProjects } from "@/lib/actions/project.service";
import { getMembers } from "@/lib/actions/member.service";
import { Member, Project, Task, User } from "@/lib/generated/prisma";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

const EditTaskModal = ({
  taskId,
  workspaceId,
}: {
  taskId: string;
  workspaceId: string;
}) => {
  const [task, setTask] = useState<
    Task & { assignee: User } & { project: Project }
  >();
  const [taskValues, setTaskValues] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    assignedTo: task?.assigneeId ?? "",
    Status: task?.Status ?? "",
    priority: task?.priority ?? "",
    Duedate: task?.Duedate ?? "",
    projectId: task?.projectId ?? "",
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<(Member & { user: User })[]>([]);

  useEffect(() => {
    getTask(taskId as string).then(setTask as any);
    getWorkSpaceProjects(workspaceId as string).then(setProjects);
    getMembers(workspaceId as string).then(setMembers as any);
  }, [taskId,workspaceId]);

  useEffect(() => {
    if (task) {
      setTaskValues({
        title: task.title ?? "",
        description: task.description ?? "",
        assignedTo: task.assigneeId ?? "",
        Status: task.Status ?? "",
        priority: task.priority ?? "",
        Duedate: task.Duedate ?? "",
        projectId: task.projectId ?? "",
      });
    }
  }, [task]);

  const edit_Task = async () => {
    await editTask({ ...taskValues, workspaceId, taskId });
    toast.success("Task edited!");
  };
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogDescription className="text-sm">
          Edit this task to your fittings.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Task title</Label>
          <Input
            autoFocus
            id="title"
            onChange={(e) =>
              setTaskValues({ ...taskValues, title: e.target.value })
            }
            value={taskValues.title}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            onChange={(e) =>
              setTaskValues({
                ...taskValues,
                description: e.target.value,
              })
            }
            value={taskValues.description}
          />
        </div>

        <div className="grid gap-2 w-full">
          <Label>Project</Label>
          <Select
            onValueChange={(value) =>
              setTaskValues({ ...taskValues, projectId: value })
            }
            value={taskValues.projectId as any}
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
              setTaskValues({ ...taskValues, assignedTo: value })
            }
            value={taskValues.assignedTo}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
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
            onChange={(e) =>
              setTaskValues({ ...taskValues, Duedate: e.target.value })
            }
            value={taskValues.Duedate}
          />
        </div>
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select
            onValueChange={(value) =>
              setTaskValues({ ...taskValues, Status: value })
            }
            value={taskValues.Status}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Backlog", "Todo", "In Progress", "In Review", "Done"].map(
                (status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Priority</Label>
          <Select
            onValueChange={(value) =>
              setTaskValues({ ...taskValues, priority: value })
            }
            value={taskValues.priority}
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
        <Button type="submit" onClick={edit_Task}>
          Edit
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditTaskModal;
