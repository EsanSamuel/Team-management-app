import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Project, User } from "@/lib/generated/prisma";
import { getWorkSpaceProjects } from "@/lib/actions/project.service";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Calendar } from "lucide-react";

const DashboardCard = ({
  workspaceProjects,
}: {
  workspaceProjects: (Project & { user: User })[];
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [workspaceId, setWorkspaceId] = useState("");

  useEffect(() => {
    if (pathname.includes("/")) {
      const [, params, workspaceId] = pathname.split("/");
      setWorkspaceId(workspaceId);
    }
  }, [pathname]);

  const routeToProject = (id: string) => {
    router.push(`/dashboard/${workspaceId}/project/${id}`);
  };
  return (
    <Card className="w-full rounded-xl p-4 shadow-sm border border-gray-200 bg-white shadow-none">
      <CardHeader className="flex gap-2 p-0 mb-1 border-b border-gray-100 overflow-x-auto overflow-hidden">
        {["Recent Projects" /*"Recent Task", "Recent Members"*/].map(
          (tab, idx) => (
            <h1 key={idx} className="text-[15px] text-gray-800 font--bold">
              {tab} ({workspaceProjects.length})
            </h1>
          )
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-5 p-0">
        {workspaceProjects?.map((project) => (
          <div
            key={project?.id}
            onClick={() => routeToProject(project.id)}
            className="cursor-pointer hover:bg-gray-50 transition rounded-lg p-3 border border-gray-100"
          >
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                {/** <span className="text-lg">{project.emoji}</span> */}
                <Badge className="bg-sidebar-primary text-[15px] text-white w-[50px] h-[50px] flex aspect-square size-10 items-center justify-center rounded-lg">
                  {project?.name[0]}
                </Badge>
                <div className="flex flex-col">
                  <h2 className="text-sm font-medium text-gray-800">
                    {project.name}
                  </h2>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <Calendar
                      className=" text-muted-foreground text-xs"
                      size={12}
                    />
                    {format(new Date(project?.createdAt), "MMMM do, yyyy")}
                  </p>
                </div>
              </div>
              <div className="xl:flex items-center gap-2 xl:block hidden">
                <span className="text-xs text-gray-600">Created by</span>
                <Avatar title={project?.user?.username} className="h-7 w-7">
                  <AvatarImage src={project?.user?.profilePicture!} />
                  <AvatarFallback>{project?.user?.username[0]}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
