"use client";
import { CaptionsOff, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldValues, useForm } from "react-hook-form";
import {
  create_workspace,
  getWorkSpace,
} from "@/lib/actions/workspace.service";
import { toast } from "sonner";
import { AddUserToWorkspace } from "@/lib/actions/member.service";
import { getUser } from "@/lib/actions/user.service";
import { Member, User, Workspace } from "@/lib/generated/prisma";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  const [workspaceprops, setWorkspace] = React.useState({
    name: "",
    description: "",
  });
  const [user, setUser] = useState<User>();
  const [workspaces, setWorkspaces] = useState<
    Workspace & { Member: Member[] }[]
  >();
  const [userWorkspaces, setuserWorkspaces] = useState([]);

  useEffect(() => {
    getUser().then(setUser as any);
    getWorkSpace().then(setWorkspaces as any);
  }, []);

  useEffect(() => {
    if (workspaces) {
      const userWorkspace = workspaces?.filter((item: any) =>
        item?.Member?.some((member: any) => member?.user?.id === user?.id)
      );
      setuserWorkspaces(userWorkspace as any);
    }
  }, [user, workspaces]);

  const createWorkspace = async () => {
    try {
      const new_workspace = await create_workspace({ ...workspaceprops });
      toast.success("Workspace has been created!");
      console.log(new_workspace);

      if (new_workspace) {
        const member = await AddUserToWorkspace(new_workspace.id, "OWNER");
        console.log(member);
        router.push(`/dashboard/${new_workspace?.id}`);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="flex flex-col gap-4 text-center max-w-md w-full">
        <CaptionsOff size={30} className="mx-auto text-gray-600" />
        <h1 className="text-gray-600 text-lg font-semibold">
          No Workspace Selected!
        </h1>
        <p className="text-gray-400 text-sm">
          {userWorkspaces.length > 0
            ? "Select a workspace or create new workspace!"
            : "You have no workspace, click the button below to create new workspace!"}
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 mx-auto">
              <Plus className="size-4" />
              <span className="text-sm font-medium">Create workspace</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Let&apos;s build a workspace</DialogTitle>
              <DialogDescription className="text-[12px]">
                Boost your productivity by making it easier for everyone to
                access projects in one direction.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 mt-4">
              <div className="grid gap-3">
                <Label htmlFor="name-1" className="text-[12px]">
                  Workspace name
                </Label>
                <Input
                  id="name-1"
                  onChange={(e) =>
                    setWorkspace((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="username-1" className="text-[12px]">
                  Workspace description
                </Label>
                <Textarea
                  id="description"
                  onChange={(e) =>
                    setWorkspace((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <DialogDescription className="text-[10px]">
                Get your members onboard with a few words about your workspace
              </DialogDescription>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full"
                onClick={createWorkspace}
              >
                Create workspace
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default page;
