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
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const page = ({ params }: { params: { workspaceId: string } }) => {
  const router = useRouter();
  const { status } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace>();
  const [members, setMembers] = useState<Member[]>([]);
  const [user, setUser] = useState<User | any>();

  useEffect(() => {
    const getWorkSpace = async () => {
      const workspace = await getWorkSpaceById(params.workspaceId);
      setWorkspace(workspace as Workspace);
      console.log(workspace);
      getMembers(params.workspaceId).then(setMembers as Member | any);
      getUser().then(setUser as any);
    };
    getWorkSpace();
  }, [params.workspaceId]);

  const joinWorkspaceAsMember = async () => {
    try {
      if (!members.some((member) => member.userId === user?.id)) {
        const member = await AddUserToWorkspace(params.workspaceId, "MEMBER");
        toast.success("You have been added to this workspace");
        router.push(`/dashboard/${params.workspaceId}`);
        console.log(member);
      } else {
        toast.error("You are already in this workspace");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-neutral-50 w-[100vw] h-[100vh] xl:px-10 px-5 flex flex-col items-center justify-center py-5 ">
      <div className="flex flex-col items-center justify-center w-full">
        <div className="flex gap-2 items-center mb-4">
          <button className="bg-black text-white rounded-full p-1">
            <Zap />
          </button>{" "}
          <h1 className="font-semibold">Sync Corp.</h1>
        </div>
        {!showAuthModal ? (
          <Card className="p-6 bg-white shadow-lg xl:w-[420px] w-full rounded-2xl text-center flex flex-col gap-4 border border-gray-100">
            <h1 className="text-xl font-semibold text-gray-800">
              👋 You're Invited to Join SyncCorp!
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              {status !== "authenticated"
                ? "To access this workspace, please log into your SyncCorp account or sign up to create one."
                : `You've been invited to join the ${workspace?.name} workspace on SyncCorp.`}
            </p>

            {status !== "authenticated" ? (
              <div className="flex gap-3 w-full mt-4">
                <Button
                  className="flex-1 bg-primary text-white hover:bg-primary/90 transition duration-200"
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

export default page;
