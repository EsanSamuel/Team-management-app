"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { editTask, getTask } from "@/lib/actions/task.service";
import { Comment, Member, Project, Task, User } from "@/lib/generated/prisma";
import { ChevronRight, Edit, Pencil } from "lucide-react";
import { useParams } from "next/navigation";
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
import { getWorkSpaceProjects } from "@/lib/actions/project.service";
import { getMembers } from "@/lib/actions/member.service";
import { toast } from "sonner";
import { createComment, getComments } from "@/lib/actions/comment.service";
import Image from "next/image";
import Discussion from "@/components/Discussion";

const Page = () => {
  const { taskId, workspaceId } = useParams();
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
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [allComments, setAllComments] = useState<(Comment & { user: User })[]>(
    []
  );

  useEffect(() => {
    getTask(taskId as string).then(setTask as any);
    getWorkSpaceProjects(workspaceId as string).then(setProjects);
    getMembers(workspaceId as string).then(setMembers as any);
    getComments(taskId as string).then(setAllComments as any);
  }, [taskId, workspaceId]);

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

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validImages: string[] = [];
    const fileReaders: FileReader[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.includes("image")) {
        toast.error("Only image files allowed!");
        return;
      }

      const reader = new FileReader();
      fileReaders.push(reader);
      reader.onload = () => {
        if (reader.result) {
          validImages.push(reader.result as string);
        }

        if (validImages.length === fileReaders.length) {
          setImages((prevImages) => [...prevImages, ...validImages]);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleComments = async () => {
    try {
      await createComment({ content: comment, images, taskId });
      toast.success("Comment created!");
    } catch (error) {
      console.log(error);
      toast.success("Something went wrong!");
    }
  };

  return (
    <div className="xl:p-10 p-3">
      <div className="flex mb-5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-[16px]">Tasks</h1>
          <p className="text-gray-500 text-[12px] dark:text-gray-400">
            View all tasks details!
          </p>
        </div>
        <Dialog>
          <form className="overflow-y-auto">
            <DialogTrigger asChild>
              <Button className="items-center">
                <Pencil className="size-3 " />
                Edit Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription className="text-[12px]">
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
                      setTaskValues({ ...taskValues, Duedate: e.target.value })
                    }
                    value={taskValues.Duedate as string}
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
          </form>
        </Dialog>
      </div>

      <div className="flex gap-2 text-[13px] items-center mb-5">
        <div className="flex gap-2">
          {/*{task?.project?.emoji}*/}
          <Badge className="h-5 min-w-5 rounded-10 px-1 justify-center bg-sidebar-primary text-center flex items-center dark:bg-white dark:text-black">
            {task?.project?.name[0]}
          </Badge>
          <h1 className="text-gray-700 dark:text-gray-300">
            {task?.project?.name}{" "}
          </h1>
        </div>
        <ChevronRight size={12} /> <span className="">{task?.title}</span>
      </div>
      <Separator />
      <div className="mt-5 grid xl:grid-cols-2 grid-cols-1 gap-5 w-full">
        <div className="bg-gray-100  dark:bg-input/30 p-3 rounded-[10px]">
          <div className="flex justify-between items-center w-full">
            <>
              <h1 className="text-gray-800 text-[13px] dark:text-gray-300 font-bold">
                Overview
              </h1>
            </>
          </div>
          <Separator className="my-2" />

          <div className="flex flex-col gap-3">
            <h1 className="text-gray-600 text-[12px] flex gap-4 dark:text-gray-100 ">
              Assignee{" "}
              <span className="flex gap-1 items-center text-gray-800 dark:text-gray-100 ">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={task?.assignee?.profilePicture!} />

                  <AvatarFallback>{task?.assignee?.username[0]}</AvatarFallback>
                </Avatar>
                {task?.assignee?.username}
              </span>
            </h1>
            <h1 className="text-gray-600 text-[12px] dark:text-gray-100 ">
              Due date{" "}
              <span className="ml-4 text-orange-500">
                {task?.Duedate.toDateString()}
              </span>
            </h1>
            <h1 className="text-gray-600 text-[12px] flex items-center gap-4 dark:text-gray-100 ">
              Status
              <Badge
                className={`ml-4 ${
                  task?.Status === "Backlog" && "bg-gray-600"
                }  ${task?.Status === "Todo" && "bg-blue-500"}  ${
                  task?.Status === "In Progress" && "bg-yellow-500"
                }  ${task?.Status === "In Review" && "bg-purple-500"}  ${
                  task?.Status === "Done" && "bg-green-500"
                } text-white  px-2 flex gap-1 items-center text-[12px]`}
              >
                {task?.Status}
              </Badge>
            </h1>
          </div>
        </div>

        <div className="p-3 rounded-[10px] border xl:min-h-auto min-h-[200px]">
          <div className="flex justify-between items-center w-full">
            <>
              <h1 className="text-gray-800 dark:text-gray-300 text-[13px] font-bold">
                Description
              </h1>
            </>
          </div>
          <Separator className="my-2" />

          {task?.description && (
            <div className="mb-5">
              <h1 className="text-[13px] text-gray-600 dark:text-gray-100 ">
                {task?.description}
              </h1>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex xl:justify-between md:items-center flex-col md:flex-row gap-2 w-full">
          <div className="flex flex-col gap-1">
            <h1 className="text-gray-600 dark:text-gray-200 text-sm">
              Discussions
            </h1>
            <p className="text-[12px] text-gray-500 dark:text-gray-400">
              View all discussions about this task
            </p>
          </div>
          <Dialog>
            <form>
              <DialogTrigger asChild>
                <Button className="xl:w- w-full">Add Comment</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Comment</DialogTitle>
                  <DialogDescription className="text-[12px]">
                    Make a comment to this task.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="name-1">Comment</Label>
                    <Input
                      id="name-1"
                      name="comment"
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="username-1">
                      Images{" "}
                      <span className="font-light text-[11px]">Optional</span>
                    </Label>
                    <Input
                      id="username-1"
                      type="file"
                      onChange={handleImages}
                      multiple
                    />

                    {images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {images.map((image, idx) => (
                          <Image
                            src={image}
                            key={idx}
                            alt="images"
                            width={400}
                            height={400}
                            className="h-[120px] rounded-[10px]"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" onClick={handleComments}>
                    Comment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>
        </div>
      </div>

      <div className="">
        <Discussion comments={allComments} taskId={taskId as any} />
      </div>
    </div>
  );
};

export default Page;
