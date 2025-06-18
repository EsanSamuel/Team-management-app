"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getMembers } from "@/lib/actions/member.service";
import { getWorkSpaceById } from "@/lib/actions/workspace.service";
import { Member, User, Workspace } from "@/lib/generated/prisma";
import { Copy } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState<Workspace>();
  const [members, setMembers] = useState<(Member & { user: User })[]>([]);

  useEffect(() => {
    const getWorkSpace = async () => {
      const workspace = await getWorkSpaceById(workspaceId as string);
      setWorkspace(workspace as Workspace);
      console.log(workspace);
    };
    getWorkSpace();
  }, [workspaceId]);

  useEffect(() => {
    const getWorkSpaceMembers = async () => {
      const members = await getMembers(workspaceId as string);
      setMembers(members as any);
      console.log(workspace);
    };
    getWorkSpaceMembers();
  }, [workspaceId]);

  return (
    <div className="xl:px-20 md:px-10 px-5 py-5">
      <div className="flex gap-3 items-center xl:px-[15%] ">
        <div className="bg-sidebar-primary text-[25px] text-white w-[50px] h-[50px] flex aspect-square size-10 items-center justify-center rounded-lg">
          {workspace?.name[0]}
        </div>
        <div className="flex flex-col">
          <h1 className="text-[17px] text-gray-700">{workspace?.name}</h1>
          <p className="text-[12px] text-gray-400">Free</p>
        </div>
      </div>
      <Separator className="mt-5" />

      <div className=" mt-10 xl:px-[15%]">
        <div className="flex flex-col gap-2">
          <h1>Workspace members</h1>
          <p className="text-[12px] text-gray-400">
            Workspace members can view and joinn at workspace projects, tasks,
            and create new task in the workspace.
          </p>
        </div>
        <Separator className="mt-5" />

        <div className="flex flex-col gap-2 mt-5">
          <h1>Invite members to join you</h1>
          <p className="text-[12px] text-gray-400">
            Anyone with an invite can join the workspace.
          </p>
          <div className="flex gap-2 mt-2">
            <Input
              value={`http://localhost:3000/invite/workspace/${workspaceId}/join`}
              className="text-gray-700 text-[13px]"
              readOnly
            />
            <Button
              onClick={() =>
                navigator.clipboard.writeText(
                  `http://localhost:3000/invite/workspace/${workspaceId}/join`
                )
              }
            >
              <Copy />
            </Button>
          </div>
        </div>
        <Separator className="mt-5" />

        <div className="mt-5 flex flex-col gap-5">
          {members?.map((member) => (
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <Avatar>
                  <AvatarImage src={member?.user?.profilePicture!} />
                  <AvatarFallback>{member?.user?.username[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col ">
                  <h1 className="text-[13px] text-gray-800">
                    {member?.user?.username}
                  </h1>
                  <>
                    <p className="text-[10px] text-gray-400">
                      {member?.user?.email}
                    </p>
                  </>
                </div>
              </div>

              <Button className="text-[12px] bg-white border-[1px] text-black">
                {member.role}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
