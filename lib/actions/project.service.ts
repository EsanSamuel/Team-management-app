"use server";

import prisma from "../prismadb";
import { getUser } from "./user.service";
import { Project, User, Workspace } from "../generated/prisma";

interface IProject {
  name: string;
  description: string;
  emoji: string;
  workspaceId?: string;
  projectId?: any;
}

export const create_Project = async ({
  name,
  description,
  emoji,
  workspaceId,
}: IProject): Promise<void> => {
  try {
    const user = await getUser();
    console.log(name, description, user?.id, workspaceId);

    if (!user?.id) {
      console.error("User is undefined in create_workspace");
      return;
    }

    const new_project = await prisma?.project?.create({
      data: {
        user: {
          connect: {
            id: user?.id,
          },
        },
        workspace: {
          connect: {
            id: workspaceId,
          },
        },
        emoji,
        name,
        description,
      },
    });

    console.log(new_project);
  } catch (error) {
    console.log(error);
  }
};

export const getWorkSpaceProjects = async (
  workspaceId: string
): Promise<(Project & { user: User } & { workspace: Workspace })[]> => {
  const user = await getUser();

  if (!user?.id) {
    console.error("User is undefined in create_workspace");
    return [];
  }
  try {
    const project = await prisma.project.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        user: true,
        workspace: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return project;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getProject = async (
  projectId: string
): Promise<
  (Project & { user: User } & { workspace: Workspace }) | undefined
> => {
  const user = await getUser();

  if (!user?.id) {
    console.error("User is undefined in create_workspace");
    return undefined;
  }
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        user: true,
        workspace: true,
      },
    });
    return project ?? undefined;
  } catch (error) {
    console.log(error);
  }
};

export const edit_Project = async ({
  name,
  description,
  emoji,
  projectId,
}: IProject): Promise<void> => {
  try {
    const user = await getUser();

    if (!user?.id) {
      console.error("User is undefined in create_workspace");
      return;
    }

    const editproject = await prisma?.project?.update({
      where: {
        id: projectId,
      },
      data: {
        emoji,
        name,
        description,
      },
    });

    console.log(editproject);
  } catch (error) {
    console.log(error);
  }
};

export const delete_Project = async (projectId: any) => {
  try {
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
