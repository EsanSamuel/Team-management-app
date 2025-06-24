import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/actions/user.service";
import { Plus } from "lucide-react";
import Image from "next/image";
import React from "react";
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

const page = async () => {
  return (
    <div className="py-5 xl:px-20 md:px-10 sm:px-2">
      <div className="flex justify-between items-baseline-last">
        <div>
          <h1 className="font-semibold text-[16px]">Workspace Overview</h1>
          <p className="text-gray-500 text-[12px]">
            Here&apos;s an overview for this workspace!
          </p>
        </div>

        <Dialog>
          <form>
            <DialogTrigger asChild>
              <Button>
                <div className="flex  items-center justify-center bg-transparent">
                  <Plus className="size-3" />
                </div>
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription className="text-[12px]">
                  Organize and manage tasks, resources, and team collaboration
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="name-1" className="text-[12px]">Project title</Label>
                  <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="username-1" className="text-[12px]">Project description</Label>
                  <Textarea />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>
      </div>

       <div className="grid xl:grid-cols-3 sm:grid-cols-1 w-full mt-7 gap-3">
        <div className="border rounded-[7px] p-7">
          <p className="text-[12px]">Total Task</p>
          <h1 className="text-[19px] font-bold">15</h1>
        </div>
        <div className="border rounded-[7px] p-7">
          <p className="text-[12px]">Overdew Task</p>
          <h1 className="text-[19px] font-bold">12</h1>
        </div>
        <div className="border rounded-[7px] p-7">
          <p className="text-[12px]">Completed Task</p>
          <h1 className="text-[19px] font-bold">1</h1>
        </div>
      </div>
    </div>
  );
};

export default page;
