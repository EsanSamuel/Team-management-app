"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  delete_Workspace,
  edit_workspace,
  getWorkSpaceById,
} from "@/lib/actions/workspace.service";
import { User, Workspace } from "@/lib/generated/prisma";
import { Description } from "@radix-ui/react-dialog";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { authorizeRole } from "@/lib/actions/member.service";
import { getUser } from "@/lib/actions/user.service";
import { toast } from "sonner";

const Page = () => {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState<Workspace>();
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [user, setUser] = useState<User>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingIsAdmin, setCheckingisAdmin] = useState(true);
  const router = useRouter();
  useEffect(() => {
    getUser().then(setUser as any);
    getWorkSpaceById(workspaceId as any).then(setWorkspace as any);
  }, [workspaceId]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.id && workspaceId) {
        const result = await authorizeRole(user?.id, workspaceId, [
          "ADMIN",
          "OWNER",
        ]);
        setIsAdmin(result as boolean);
        setCheckingisAdmin(false);
      }
    };

    checkAdmin();
  }, [user?.id, workspaceId]);

  useEffect(() => {
    if (!checkingIsAdmin && isAdmin === false) {
      alert("You are not eligible for this page");
      return router.push(`/dashboard/${workspaceId}`);
    }
  },  [checkingIsAdmin, isAdmin, router, workspaceId]);

  useEffect(() => {
    if (workspace) {
      setForm({
        name: workspace.name ?? "",
        description: workspace.description ?? "",
      });
    }
  }, [workspace]);

  const editWorkspace = async () => {
    await edit_workspace({ ...form, workspaceId });
    toast.success("Workspace updated!")
  };

  const deleteWorkspace = async () => {
    await delete_Workspace(workspaceId);
    toast.success("Workspace deleted!")
  };

  return (
    <div className="xl:px-[15%] md:px-10 px-5 py-5">
      <div className="flex gap-3 items-center ">
        <div className="bg-sidebar-primary text-[25px] text-white w-[50px] h-[50px] flex aspect-square size-10 items-center justify-center rounded-lg">
          {workspace?.name[0]}
        </div>
        <div className="flex flex-col">
          <h1 className="text-[17px] text-gray-700">{workspace?.name}</h1>
          <p className="text-[12px] text-gray-400">Free</p>
        </div>
      </div>
      <Separator className="my-5" />
      <div className="">
        <h1 className=" font-bold text-gray-700">Workspace settings</h1>
        <p className="font-bold text-gray-700 mt-5 text-[14px]">
          Edit Workspace
        </p>
        <Separator className="my-5" />
        <form className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <h1 className="text-gray-800 text-[12px]">Workspace name</h1>
            <Input
              className="w-full h-[40px] border-[1px] placeholder:text-[13px]"
              placeholder="Enter Username"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <h1 className="text-gray-800 text-[12px]">Workspace description</h1>
            <Textarea
              className="w-full h-[100px] border-[1px] placeholder:text-[13px]"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <div className="items-end flex justify-end">
            <Button className="items-end " onClick={editWorkspace}>
              Edit Workspace
            </Button>
          </div>
        </form>

        <div className="mt-5">
          <h1 className=" font-bold text-gray-700">Delele Workspace</h1>
          <Separator className="my-2" />
          <p className="text-[12px] text-gray-600">
            Permanently delete this workspace and all associated projects and
            tasks. This action cannot be undone.
          </p>
          <div className="items-end flex justify-end mt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-red-400 hover:bg-red-500 hover:text-white text-white"
                >
                  Delete workspace
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-400"
                    onClick={deleteWorkspace}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
