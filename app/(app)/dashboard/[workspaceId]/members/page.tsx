"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  authorizeRole,
  editRole,
  getMembers,
  remove_Member,
} from "@/lib/actions/member.service";
import { getUser } from "@/lib/actions/user.service";
import { getWorkSpaceById } from "@/lib/actions/workspace.service";
import { Member, User, Workspace } from "@/lib/generated/prisma";
import { Check, ChevronDown, Copy } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Page = () => {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState<Workspace>();
  const [members, setMembers] = useState<(Member & { user: User })[]>([]);
  const [user, setUser] = useState<User>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const getWorkSpace = async () => {
      const workspace = await getWorkSpaceById(workspaceId as string);
      setWorkspace(workspace as Workspace);
    };
    getWorkSpace();
    getUser().then(setUser as any);
  }, [workspaceId]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.id && workspaceId) {
        const result = await authorizeRole(user?.id, workspaceId, [
          "ADMIN",
          "OWNER",
        ]);
        setIsAdmin(result as boolean);
      }
    };

    checkAdmin();
  }, [user?.id, workspaceId]);

  useEffect(() => {
    const getWorkSpaceMembers = async () => {
      const members = await getMembers(workspaceId as string);
      setMembers(members as any);
    };
    getWorkSpaceMembers();
  }, [workspaceId]);

  const updateUserRole = async (memberId: string, role: "ADMIN" | "MEMBER") => {
    await editRole(memberId, role);
    toast(`User has been updated to ${role}`);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `http://localhost:3000/invite/workspace/${workspaceId}/join`
      );
      setCopied(true);
    } catch (error) {
      console.log("Copied failed:", error);
    }
  };

  const removeMember = async (memberId: string) => {
    await remove_Member(memberId);
    toast.success("User has been removed from this workspace!");
  };

  return (
    <div className="xl:px-20 md:px-10 px-5 py-5">
      <div className="flex gap-3 items-center xl:px-[15%] ">
        <div className="bg-sidebar-primary text-[25px] text-white w-[50px] h-[50px] flex aspect-square size-10 items-center justify-center rounded-lg dark:bg-white dark:text-black">
          {workspace?.name[0]}
        </div>
        <div className="flex flex-col">
          <h1 className="text-[17px] text-gray-700 dark:text-gray-100">
            {workspace?.name}
          </h1>
          <p className="text-[12px] text-gray-400">Free</p>
        </div>
      </div>
      <Separator className="mt-5" />

      <div className=" mt-10 xl:px-[15%]">
        <div className="flex flex-col gap-2">
          <h1>Workspace members</h1>
          <p className="text-[12px] text-gray-400">
            Workspace members can view and join at workspace projects, tasks,
            and create new task in the workspace.
          </p>
        </div>
        <Separator className="mt-5" />

        <div className="flex flex-col gap-2 mt-5">
          <h1>Invite members to join you</h1>
          <p className="text-[12px] text-gray-400">
            Anyone with an invite can join the workspace.
          </p>
          {isAdmin ? (
            <div className="flex gap-2 mt-2">
              <Input
                value={`https://synccorp.vercel.app/invite/workspace/${workspaceId}/join`}
                className="text-gray-700 dark:text-gray-300 text-[13px]"
                readOnly
              />
              {!copied ? (
                <Button onClick={handleCopy}>
                  <Copy />
                </Button>
              ) : (
                <Button>
                  <Check />
                </Button>
              )}
            </div>
          ) : (
            <h1 className="mt-5 text-center text-[13px] text-gray-700 dark:text-gray-300 ">
              Only admins can invite members.
            </h1>
          )}
        </div>
        <Separator className="mt-5" />

        <div className="mt-5 flex flex-col gap-5">
          {members?.map((member) => (
            <div className="flex justify-between items-center" key={member.id}>
              <div className="flex gap-3 items-center">
                <Avatar>
                  <AvatarImage src={member?.user?.profilePicture!} />
                  <AvatarFallback>{member?.user?.username[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col ">
                  <h1 className="text-[13px] text-gray-800 dark:text-gray-100">
                    {member?.user?.username}
                  </h1>
                  <>
                    <p className="text-[10px] text-gray-400">
                      {member?.user?.email}
                    </p>
                  </>
                </div>
              </div>

              {isAdmin && member.role !== "OWNER" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    {" "}
                    <Button className="text-[12px] bg-white border-[1px] text-black flex gap-1 items-center">
                      {member.role} <ChevronDown size={12} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Change member role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => updateUserRole(member.id, "ADMIN")}
                    >
                      ADMIN
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateUserRole(member.id, "MEMBER")}
                    >
                      MEMBER
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-400 hover:text-red-500"
                      onClick={() => removeMember(member.id)}
                    >
                      Remove {member?.user?.username}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button className="text-[12px] bg-white border-[1px] text-black">
                  {member.role}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
