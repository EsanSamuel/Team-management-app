import {
  ArrowRightLeft,
  ChevronsUpDown,
  Circle,
  CircleCheck,
  CircleHelp,
  ListChecks,
  ScanEye,
  Timer,
  User as Person,
  Plus,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Member, Project, Task, User } from "@/lib/generated/prisma";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMembers } from "@/lib/actions/member.service";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger } from "./ui/dialog";
import CreateTask from "./CreateTask";

const Karban = ({
  tasks,
  workspaceId,
  setView,
}: {
  tasks: any[];
  workspaceId?: string;
  setView?: any;
}) => {
  const [filteredBacklog, setFilteredBacklog] = useState<
    (Task & { assignee: User } & { project: Project })[]
  >([]);
  const [filteredTodo, setFilteredTodo] = useState<
    (Task & { assignee: User } & { project: Project })[]
  >([]);
  const [filteredProgress, setFilteredProgress] = useState<
    (Task & { assignee: User } & { project: Project })[]
  >([]);
  const [filteredDone, setFilteredDone] = useState<
    (Task & { assignee: User } & { project: Project })[]
  >([]);
  const [filteredReview, setFilteredReview] = useState<
    (Task & { assignee: User } & { project: Project })[]
  >([]);
  const [filterByStatus, setFilterByStatus] = useLocalStorage<any>("value", {
    filterBy: "",
    array: [],
  });
  const [searchTasks, setSearchTasks] = useState<string>("");
  const [members, setMembers] = useState<(Member & { user: User })[]>([]);

  useEffect(() => {
    getMembers(workspaceId as string).then(setMembers as any);
  }, [workspaceId]);

  const filterStatus = useCallback(
    (value: { filterBy: string; array: any[] }) => {
      const statusArray = [
        "Backlog",
        "Todo",
        "In Progress",
        "In Review",
        "Done",
      ];
      const priorityArray = ["Low", "Medium", "High"];
      const membersArray = members;
      if (
        Array.isArray(statusArray) &&
        statusArray.some((status) => value.array!.includes(status))
      ) {
        return value.filterBy
          ? tasks.filter((task) => task.Status === value.filterBy)
          : tasks;
      } else if (
        Array.isArray(priorityArray) &&
        priorityArray.some((priority) => value.array!.includes(priority))
      ) {
        return value.filterBy
          ? tasks.filter((task) => task.priority === value.filterBy)
          : tasks;
      } else if (
        Array.isArray(membersArray) &&
        membersArray.some((member) => value.array!.includes(member))
      ) {
        return value.filterBy
          ? tasks.filter((task) => task.assignee.username === value.filterBy)
          : tasks;
      } else {
        return tasks;
      }
    },
    [tasks, members]
  );

  const filterTaskWithSearchBar = useCallback(() => {
    if (!searchTasks.trim()) return filterStatus(filterByStatus);

    const matchSearch = (task: Task & { assignee: User }) =>
      [
        task.title.toLowerCase(),
        task.Status.toLowerCase(),
        task.Duedate.toLowerCase(),
        task.assignee.username.toLowerCase(),
        task.priority.toLowerCase(),
      ].some((field) => field.includes(searchTasks));

    return filterStatus(filterByStatus).filter(matchSearch);
  }, [filterStatus, filterByStatus, searchTasks]);

  const getDoneTaskCount = tasks.filter(
    (task) => task.Status === "DONE"
  ).length;

  useEffect(() => {
    setFilteredBacklog(
      filterTaskWithSearchBar()?.filter(
        (task) => task.Status === "Backlog"
      ) as any
    );
    setFilteredTodo(
      filterTaskWithSearchBar()?.filter((task) => task.Status === "Todo") as any
    );
    setFilteredDone(
      filterTaskWithSearchBar()?.filter((task) => task.Status === "Done") as any
    );
    setFilteredProgress(
      filterTaskWithSearchBar()?.filter(
        (task) => task.Status === "In Progress"
      ) as any
    );
    setFilteredReview(
      filterTaskWithSearchBar()?.filter(
        (task) => task.Status === "In Review"
      ) as any
    );
  }, [filterTaskWithSearchBar]);

  return (
    <>
      <div className="flex justify-between gap-2 w-full mt-5">
        <div className="overflow-x-auto overflow-hidden">
          <div className="flex flex-wrap md:flex-nowrap gap-2 text-gray-600 min-w-[320px]">
            <Input
              placeholder="Filter tasks..."
              onChange={(e) => setSearchTasks(e.target.value)}
              className="min-w-[200px]"
            />

            <DropdownMenu>
              <DropdownMenuTrigger className="">
                <Button className="bg-white border text-[12px] text-gray-800 flex items-center gap-2">
                  <ArrowRightLeft /> Priority{" "}
                  <ChevronsUpDown size={12} className="text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Priority</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["Low", "Medium", "High"].map((priority, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() =>
                      setFilterByStatus({
                        ...filterByStatus,
                        filterBy: priority,
                        array: ["Low", "Medium", "High"],
                      })
                    }
                  >
                    {priority}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    setFilterByStatus({
                      ...filterByStatus,
                      filterBy: "",
                      array: ["Low", "Medium", "High"],
                    })
                  }
                >
                  Clear Filter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="">
                <Button className="bg-white border text-[12px] text-gray-800 flex items-center gap-2">
                  <Person />
                  Assigned To{" "}
                  <ChevronsUpDown size={12} className="text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Assignees</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {members.map((member) => (
                  <DropdownMenuItem
                    key={member.id}
                    className="flex gap-2 items-center"
                    onClick={() =>
                      setFilterByStatus({
                        ...filterByStatus,
                        filterBy: member.user.username,
                        array: members,
                      })
                    }
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={member.user.profilePicture!} />
                      <AvatarFallback>{member.user.username[0]}</AvatarFallback>
                    </Avatar>
                    <span>{member.user.username}</span>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    setFilterByStatus({
                      ...filterByStatus,
                      filterBy: "",
                    })
                  }
                >
                  Clear Filter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Select onValueChange={(value) => setView(value)}>
          <SelectTrigger className="w-auto xl:ml-0 ml-2">
            <SelectValue
              placeholder="View As"
              className="placeholder:text-gray-400"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Table" className="text-gray-600">
              Table
            </SelectItem>
            <SelectItem value="Karban">Karban</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto overflow-hidden ">
        <div className="grid xl:grid-cols-4 grid-cols-5 xl:min-w-auto min-w-[1300px] gap-6 mt-5">
          <div className="bg-gray-100 rounded-xl p-2 h-[70vh] overflow-y-auto shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <CircleHelp className="h-4 w-4" /> Backlog{" "}
                <Badge className="bg-muted text-muted-foreground text-xs px-2 rounded-full">
                  {filteredBacklog.length}
                </Badge>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Plus size={13} />
                </DialogTrigger>
                <CreateTask workspaceId={workspaceId!} status="Backlog" />
              </Dialog>
            </div>

            {filteredBacklog.map((task, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 shadow hover:shadow-md transition-all duration-200 mb-3"
              >
                <h2 className="font-medium text-sm text-gray-800 truncate">
                  {task.title}
                </h2>
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee.profilePicture!} />
                      <AvatarFallback>
                        {task.assignee.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{task.assignee.username}</span>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      new Date(task.Duedate) < new Date()
                        ? "bg-red-100 text-red-500"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {task.Duedate}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1 truncate">
                  {task.project.emoji} {task.project.name}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-100 rounded-xl p-2 h-[70vh] overflow-y-auto shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Circle className="h-4 w-4 text-blue-500" /> Todo
                <Badge className="bg-muted text-muted-foreground text-xs px-2 rounded-full">
                  {filteredTodo.length}
                </Badge>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Plus size={13} />
                </DialogTrigger>
                <CreateTask workspaceId={workspaceId!} status="Todo" />
              </Dialog>
            </div>

            {filteredTodo.map((task, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 shadow hover:shadow-md transition-all duration-200 mb-3"
              >
                <h2 className="font-medium text-sm text-gray-800 truncate">
                  {task.title}
                </h2>
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee.profilePicture!} />
                      <AvatarFallback>
                        {task.assignee.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{task.assignee.username}</span>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      new Date(task.Duedate) < new Date()
                        ? "bg-red-100 text-red-500"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {task.Duedate}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1 truncate">
                  {task.project.emoji} {task.project.name}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-100 rounded-xl p-2 h-[70vh] overflow-y-auto shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Timer className="h-4 w-4 text-yellow-500" /> Progress
                <Badge className="bg-muted text-muted-foreground text-xs px-2 rounded-full">
                  {filteredProgress.length}
                </Badge>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Plus size={13} />
                </DialogTrigger>
                <CreateTask workspaceId={workspaceId!} status="In Progress" />
              </Dialog>
            </div>

            {filteredProgress.map((task, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 shadow hover:shadow-md transition-all duration-200 mb-3"
              >
                <h2 className="font-medium text-sm text-gray-800 truncate">
                  {task.title}
                </h2>
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee.profilePicture!} />
                      <AvatarFallback>
                        {task.assignee.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{task.assignee.username}</span>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      new Date(task.Duedate) < new Date()
                        ? "bg-red-100 text-red-500"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {task.Duedate}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1 truncate">
                  {task.project.emoji} {task.project.name}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-100 rounded-xl p-2 h-[70vh] overflow-y-auto shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <ScanEye className="h-4 w-4 text-purple-500" /> Review
                <Badge className="bg-muted text-muted-foreground text-xs px-2 rounded-full">
                  {filteredReview.length}
                </Badge>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Plus size={13} />
                </DialogTrigger>
                <CreateTask workspaceId={workspaceId!} status="In Review" />
              </Dialog>
            </div>

            {filteredReview.map((task, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 shadow hover:shadow-md transition-all duration-200 mb-3"
              >
                <h2 className="font-medium text-sm text-gray-800 truncate">
                  {task.title}
                </h2>
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee.profilePicture!} />
                      <AvatarFallback>
                        {task.assignee.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{task.assignee.username}</span>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      new Date(task.Duedate) < new Date()
                        ? "bg-red-100 text-red-500"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {task.Duedate}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1 truncate">
                  {task.project.emoji} {task.project.name}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-100 rounded-xl p-2 h-[70vh] overflow-y-auto shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <CircleCheck className="h-4 w-4 text-green-500" /> Done
                <Badge className="bg-muted text-muted-foreground text-xs px-2 rounded-full">
                  {filteredDone.length}
                </Badge>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Plus size={13} />
                </DialogTrigger>
                <CreateTask workspaceId={workspaceId!} status="Done" />
              </Dialog>
            </div>

            {filteredDone.map((task, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 shadow hover:shadow-md transition-all duration-200 mb-3"
              >
                <h2 className="font-medium text-sm text-gray-800 truncate">
                  {task.title}
                </h2>
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee.profilePicture!} />
                      <AvatarFallback>
                        {task.assignee.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{task.assignee.username}</span>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-600 `}
                  >
                    {task.Duedate}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1 truncate">
                  {task.project.emoji} {task.project.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Karban;
