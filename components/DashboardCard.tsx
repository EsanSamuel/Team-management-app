import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Project, Task, User } from "@/lib/generated/prisma";
import { getWorkSpaceProjects } from "@/lib/actions/project.service";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Calendar, Dot, ListChecks } from "lucide-react";

const DashboardCard = ({
  workspaceProjects,
}: {
  workspaceProjects: (Project & { user: User } & { Task: Task[] })[];
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [workspaceId, setWorkspaceId] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (pathname.includes("/")) {
      const [, params, workspaceId] = pathname.split("/");
      setWorkspaceId(workspaceId);
    }
  }, [pathname]);

  const routeToProject = (id: string) => {
    router.push(`/dashboard/${workspaceId}/project/${id}`);
  };

  const getProjects = (): (Project & { user: User; Task: Task[] })[] => {
    return showAll ? workspaceProjects : workspaceProjects.slice(0, 4);
  };

  return (
    <Card className="w-full rounded-xl px-3 py-3 shadow-sm border light:border-gray-200  shadow-none">
      <CardHeader className="flex gap-2 p-0 mb-1 border-b light:border-gray-100 overflow-x-auto overflow-hidden">
        {["Recent Projects" /*"Recent Task", "Recent Members"*/].map(
          (tab, idx) => (
            <h1
              key={idx}
              className="text-[15px] text-gray-800 dark:text-gray-100 font--bold"
            >
              {tab} ({workspaceProjects.length})
            </h1>
          )
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-5 p-0">
        {getProjects()?.map((project: any) => (
          <div
            key={project?.id}
            onClick={() => routeToProject(project.id)}
            className="cursor-pointer light:hover:bg-gray-50 transition rounded-lg p-3 border light:border-gray-100"
          >
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                {/** <span className="text-lg">{project.emoji}</span> */}
                <Badge
                  className="bg-sidebar-primary text-[15px] text-white w-[50px] h-[50px] flex aspect-square size-10
                 items-center justify-center rounded-lg dark:bg-white dark:text-black"
                >
                  {project?.name[0]}
                </Badge>
                <div className="flex flex-col">
                  <h2 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {project.name}
                  </h2>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    {/* Date Group */}
                    <div className="flex items-center gap-1">
                      <Calendar className="text-muted-foreground" size={12} />
                      <p>
                        {format(new Date(project?.createdAt), "MMMM do, yyyy")}
                      </p>
                    </div>

                    {/* Dot as separator */}
                    <Dot className="text-gray-400" />

                    {/* Task Group */}
                    <div className="flex items-center gap-1">
                      <ListChecks size={12} />
                      <p>{project?.Task?.length} tasks</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="xl:flex items-center gap-2 xl:block hidden">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Created by
                </span>
                <Avatar title={project?.user?.username} className="h-7 w-7">
                  <AvatarImage src={project?.user?.profilePicture!} />
                  <AvatarFallback>{project?.user?.username[0]}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="px-0">
        <Button
          className="w-full dark:bg-input/30 dark:text-white bg-input/50 text-gray-700 border-[1px]"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll === false ? "Show All " : "Show less"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DashboardCard;
