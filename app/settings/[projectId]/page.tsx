"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import {
  delete_Project,
  edit_Project,
  getProject,
} from "@/lib/actions/project.service";
import { useParams } from "next/navigation";
import { Project } from "@/lib/generated/prisma";
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
import { toast } from "sonner";

export default function EditProjectPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project>();
  const [form, setForm] = useState({
    emoji: "",
    name: "",
    description: "",
  });
  useEffect(() => {
    getProject(projectId as string).then(setProject as any);
  }, [projectId]);

  useEffect(() => {
    setForm({
      emoji: project?.emoji ?? "",
      name: project?.name ?? "",
      description: project?.description ?? "",
    });
  }, [project]);

  const edit_workspace_project = async () => {
    try {
      const editproject = await edit_Project({ ...form, projectId });
      toast.success("Project edited!")
      console.log(editproject);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex justify-center items-start p-6">
      <Card className="w-full max-w-2xl p-6 space-y-8 rounded-2xl shadow-md">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back
          </button>
          <h2 className="text-xl font-semibold truncate">
            {project?.name || "Edit Project"}
          </h2>
        </div>

        {/* Project Emoji */}
        <div className="space-y-2">
          <Label htmlFor="project-emoji">Project Emoji</Label>
          <Input
            id="project-emoji"
            placeholder="e.g. 🚀"
            value={form.emoji}
            onChange={(e) => setForm({ ...form, emoji: e.target.value })}
          />
        </div>

        {/* Project Name */}
        <div className="space-y-2">
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            placeholder="e.g. Mobile App Development"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Project Description */}
        <div className="space-y-2">
          <Label htmlFor="project-description">Project Description</Label>
          <Textarea
            id="project-description"
            className="h-[100px]"
            placeholder="Describe the project's purpose or features..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={edit_workspace_project}>Save Changes</Button>
        </div>

        <Separator />

        {/* Danger Zone */}
        <div className="space-y-3">
          <h3 className="text-red-400 text-lg font-semibold">Danger Zone</h3>
          <p className="text-sm text-muted-foreground">
            Deleting a project is irreversible and will remove all associated
            data.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-red-400 hover:bg-red-500 hover:text-white text-white"
              >
                Delete
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
                  onClick={() => delete_Project(projectId)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </div>
  );
}
