"use client";
import { Member, Project, Task, User } from "@/lib/generated/prisma";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDown,
  ArrowRight,
  ArrowRightLeft,
  ArrowUp,
  ChevronsUpDown,
  Circle,
  CircleCheck,
  CircleHelp,
  CirclePlus,
  Folder,
  ListChecks,
  ScanEye,
  Timer,
  Trash2,
} from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  User as Person,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getMembers } from "@/lib/actions/member.service";
import { useRouter } from "next/navigation";
import { getWorkSpaceProjects } from "@/lib/actions/project.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { delete_Task } from "@/lib/actions/task.service";
import { toast } from "sonner";
import { Dialog, DialogTrigger } from "./ui/dialog";
import EditTaskModal from "./EditTaskModal";

const TaskCard = ({
  tasks,
  workspaceId,
  setView,
}: {
  tasks: any[];
  workspaceId?: string;
  setView?: any;
}) => {
  const router = useRouter();
  const [selected, setSelected] = React.useState<string[]>([]);
  const [filterByStatus, setFilterByStatus] = useLocalStorage<any>("value", {
    filterBy: "",
    array: [],
  });
  const [searchTasks, setSearchTasks] = useState<string>("");
  const [members, setMembers] = useState<(Member & { user: User })[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getMembers(workspaceId as string).then(setMembers as any);
    getWorkSpaceProjects(workspaceId as string).then(setProjects);
  }, [workspaceId]);

  const filterStatus = (value: { filterBy: string; array: any[] }) => {
    const statusArray = ["Backlog", "Todo", "In Progress", "In Review", "Done"];
    const priorityArray = ["Low", "Medium", "High"];
    const membersArray = members;
    const projectArrays = projects;
    if (
      Array.isArray(statusArray) &&
      statusArray.some((status) => value.array!.includes(status))
    ) {
      console.log(tasks.filter((task) => task.Status === value.filterBy));
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
    } else if (
      Array.isArray(projectArrays) &&
      projectArrays.some((project) => value.array!.includes(project))
    ) {
      return value.filterBy
        ? tasks.filter((task) => task.project.name === value.filterBy)
        : tasks;
    } else {
      return tasks;
    }
  };

  const filterTaskWithSearchBar = () => {
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
  };

  const filterByDueDate = () => {
    return filterTaskWithSearchBar().sort(
      (a: Task, b: Task) =>
        new Date(a.Duedate).getDate() - new Date(b.Duedate).getDate()
    );
  };

  const toggleRow = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const allSelected = tasks.length > 0 && selected.length === tasks.length;

  const toggleAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(tasks.map((task) => task.id));
  };

  const TaskStatus = (index: number) => {
    if (filterTaskWithSearchBar()[index].Status === "Backlog") {
      return (
        <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100 px-2 flex gap-1 items-center text-[12px]">
          <CircleHelp />
          {filterTaskWithSearchBar()[index].Status.toUpperCase()}
        </Badge>
      );
    } else if (filterTaskWithSearchBar()[index].Status === "Todo") {
      return (
        <Badge className="bg-blue-100 text-blue-500 hover:bg-blue-100 px-2 flex gap-1 items-center text-[12px]">
          <Circle />
          {filterTaskWithSearchBar()[index].Status.toUpperCase()}
        </Badge>
      );
    } else if (filterTaskWithSearchBar()[index].Status === "In Progress") {
      return (
        <Badge className="bg-yellow-100 text-yellow-500 hover:bg-yellow-100 px-2 flex gap-1 items-center text-[12px]">
          <Timer />
          {filterTaskWithSearchBar()[index].Status.toUpperCase()}
        </Badge>
      );
    } else if (filterTaskWithSearchBar()[index].Status === "In Review") {
      return (
        <Badge className="bg-purple-100 text-purple-500 hover:bg-purple-100 px-2 flex gap-1 items-center text-[12px]">
          <ScanEye />
          {filterTaskWithSearchBar()[index].Status.toUpperCase()}
        </Badge>
      );
    } else if (filterTaskWithSearchBar()[index].Status === "Done") {
      return (
        <Badge className="bg-green-100 text-green-500 hover:bg-green-100 px-2 flex gap-1 items-center text-[12px]">
          <CircleCheck />
          {filterTaskWithSearchBar()[index].Status.toUpperCase()}
        </Badge>
      );
    }
  };
  return (
    <div className="mt-5">
      <div className="flex justify-between gap-3 w-full">
        <div className=" overflow-x-auto overflow-hidden">
          <div className="flex flex-wrap md:flex-nowrap gap-2 text-gray-600 min-w-[320px]">
            <Input
              placeholder="Filter tasks..."
              onChange={(e) => setSearchTasks(e.target.value)}
              className="min-w-[200px]"
            />

            <DropdownMenu>
              <DropdownMenuTrigger className="">
                <Button className="bg-white border text-[12px] text-gray-800 flex items-center gap-2">
                  <ListChecks />
                  Status <ChevronsUpDown size={7} className="text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {["Backlog", "Todo", "In Progress", "In Review", "Done"].map(
                  (status, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() =>
                        setFilterByStatus({
                          ...filterByStatus,
                          filterBy: status,
                          array: [
                            "Backlog",
                            "Todo",
                            "In Progress",
                            "In Review",
                            "Done",
                          ],
                        })
                      }
                    >
                      {status}
                    </DropdownMenuItem>
                  )
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    setFilterByStatus({
                      ...filterByStatus,
                      filterBy: "",
                      array: [
                        "Backlog",
                        "Todo",
                        "In Progress",
                        "In Review",
                        "Done",
                      ],
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
              <DropdownMenuTrigger className="" asChild>
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

            <DropdownMenu>
              <DropdownMenuTrigger className="">
                <Button className="bg-white border text-[12px] text-gray-800 flex items-center gap-2">
                  <Folder /> Projects{" "}
                  <ChevronsUpDown size={12} className="text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Projects</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() =>
                      setFilterByStatus({
                        ...filterByStatus,
                        filterBy: project.name,
                        array: projects,
                      })
                    }
                  >
                    {project?.emoji} {project?.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    setFilterByStatus({
                      ...filterByStatus,
                      filterBy: "",
                      array: projects,
                    })
                  }
                >
                  Clear Filter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/*<Button onClick={filterByDueDate}>Filter By Due date</Button>*/}
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
      <div className="w-full mt-5 text-gray-600">
        <div className="rounded-md border text-gray-600">
          <Table>
            <TableHeader className="text-gray-600 text-[13px]">
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="text-gray-600 text-[13px] flex gap-2 items-center">
                  Task name <ArrowUpDown size={13} />
                </TableHead>
                <TableHead className="text-gray-600 text-[13px] ">
                  <div className="flex gap-2 items-center">
                    {" "}
                    Project <ArrowUpDown size={13} />
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 text-[13px] ">
                  <div className="flex gap-2 items-center">
                    Assigned To <ArrowUpDown size={13} />
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 text-[13px]">
                  <div className="flex gap-2 items-center">
                    Due Date <ArrowUpDown size={13} />
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 text-[13px]">
                  <div className="flex gap-2 items-center">
                    Status <ArrowUpDown size={13} />
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 text-[13px]">
                  <div className="flex gap-2 items-center">
                    Priority <ArrowUpDown size={13} />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="">
              {filterTaskWithSearchBar().map((task, index) => (
                <TableRow key={task.id} className="text-[13px] align-middle">
                  <TableCell className="">
                    <Checkbox
                      checked={selected.includes(task.id)}
                      onCheckedChange={() => toggleRow(task.id)}
                      aria-label="Select row"
                    />
                  </TableCell>
                  <TableCell className="flex gap-3 items-center">
                    <Button className="bg-white border text-[12px] text-gray-600 flex items-center gap-2">
                      Task-{index + 1}
                    </Button>
                    {task.title}
                  </TableCell>
                  <TableCell>
                    {task?.project?.emoji}{" "}
                    {task?.project?.name && (
                      <span className="ml-1" title={task.project.name}>
                        {task.project.name.length > 16
                          ? `${task.project.name.slice(0, 16)}...`
                          : task.project.name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="align-middle">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage
                          src={task?.assignee?.profilePicture!}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs">
                          {task.assignee.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[13px]">
                        {task.assignee.username}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {" "}
                    {format(new Date(task?.Duedate), "MMMM do, yyyy")}
                  </TableCell>
                  <TableCell>{TaskStatus(index)}</TableCell>
                  <TableCell>
                    <div
                      className={`${
                        task.priority === "High" && "text-red-500"
                      } ${task.priority === "Medium" && "text-orange-500"}
                      ${
                        task.priority === "Low" && "text-gray-600"
                      }  flex items-center gap-2`}
                    >
                      {task.priority === "High" && <ArrowUp size={12} />}
                      {task.priority === "Low" && <ArrowDown size={12} />}
                      {task.priority === "Medium" && (
                        <ArrowRight size={12} />
                      )}{" "}
                      {task.priority}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => navigator.clipboard.writeText(task.id)}
                        >
                          Copy Task ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/dashboard/${workspaceId}/TaskContent/${task.id}`
                            )
                          }
                        >
                          View Task
                        </DropdownMenuItem>

                        <Dialog>
                          <DialogTrigger asChild>
                            <h1
                              className="focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive
                               data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20
                             data-[variant=destructive]:focus:text-destructive 
                             data-[variant=destructive]:*:[svg]:!text-destructive 
                             [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default 
                             items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none 
                             data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                            >
                              Edit Task
                            </h1>
                          </DialogTrigger>
                          <EditTaskModal
                            workspaceId={workspaceId!}
                            taskId={task.id}
                          />
                        </Dialog>

                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="bg-red-400 hover:bg-red-500 hover:text-white text-white mt-1 flex gap-2 items-center"
                            >
                              <Trash2 /> Delete Task
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your account and remove your
                                data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-400"
                                onClick={() => {
                                  delete_Task(task?.id);
                                  toast.success("Task removed!");
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          {selected.length} of {tasks.length} selected
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
