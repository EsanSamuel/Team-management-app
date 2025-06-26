"use client";
import Authform from "@/components/AuthComponent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddUserToWorkspace, getMembers } from "@/lib/actions/member.service";
import { getUser } from "@/lib/actions/user.service";
import { getWorkSpaceById } from "@/lib/actions/workspace.service";
import { Member, User, Workspace } from "@/lib/generated/prisma";
import { ShieldHalf, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const Page = () => {
  const { workspaceId } = useParams();
  const router = useRouter();
  const { status } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace>();
  const [members, setMembers] = useState<Member[]>([]);
  const [user, setUser] = useState<User | any>();

  useEffect(() => {
    const getWorkSpace = async () => {
      const workspace = await getWorkSpaceById(workspaceId as any);
      setWorkspace(workspace as Workspace);
      console.log(workspace);
      getMembers(workspaceId as any).then(setMembers as Member | any);
      getUser().then(setUser as any);
    };
    getWorkSpace();
  }, [workspaceId]);

  const joinWorkspaceAsMember = async () => {
    try {
      if (!members.some((member) => member.userId === user?.id)) {
        const member = await AddUserToWorkspace(workspaceId as any, "MEMBER");
        toast.success("You have been added to this workspace");
        router.push(`/dashboard/${workspaceId}`);
        console.log(member);
      } else {
        toast.error("You are already in this workspace");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-2 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </div>
          Sync Corp.
        </a>
        {!showAuthModal ? (
          <Card className="p-6 light:bg-white shadow-lg xl:w-[420px] w-full rounded-2xl text-center flex flex-col gap-4 border light:border-gray-100">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              👋 You&apos;re Invited to Join Sync corp!
            </h1>
            <p className="text-gray-500 dark:text-gray-300 text-sm leading-relaxed">
              {status !== "authenticated"
                ? "To access this workspace, please log into your Sync corp account or sign up to create one."
                : `You've been invited to join the ${workspace?.name} workspace on SyncCorp.`}
            </p>

            {status !== "authenticated" ? (
              <div className="flex gap-3 w-full mt-4">
                <Button
                  className="flex-1 bg-primary text-white dark:bg-input/30 hover:bg-primary/90 transition duration-200"
                  onClick={() => setShowAuthModal(true)}
                >
                  Sign Up
                </Button>
                <Button
                  className="flex-1 bg-gray-100 text-gray-800 hover:bg-gray-200 transition duration-200"
                  onClick={() => setShowAuthModal(true)}
                >
                  Login
                </Button>
              </div>
            ) : (
              <Button
                className="bg-green-400 hover:bg-green-400 hover:opacity-50 text-white"
                onClick={joinWorkspaceAsMember}
              >
                Join this workspace
              </Button>
            )}
          </Card>
        ) : (
          <Authform setShowAuthModal={setShowAuthModal as any} />
        )}
      </div>
    </div>
  );
};

export default Page;
