"use server";

import prisma from "../prismadb";
import { getUser } from "./user.service";
import { Member, Workspace } from "../generated/prisma";

interface IWorkspace {
  name: string;
  description: string;
  workspaceId?: any;
}

export const create_workspace = async ({ name, description }: IWorkspace) => {
  try {
    const user = await getUser();
    console.log(name, description, user?.id);

    if (!user?.id) {
      console.error("User is undefined in create_workspace");
      return;
    }

    const new_workspace = await prisma.workspace.create({
      data: {
        user: {
          connect: {
            id: user?.id,
          },
        },
        name,
        description,
      },
    });
    console.log(new_workspace);
    return new_workspace;
  } catch (error) {
    console.log(error);
  }
};

export const getWorkSpace = async () => {
  const user = await getUser();

  if (!user?.id) {
    console.error("User is undefined in create_workspace");
    return;
  }
  try {
    const workspace = await prisma.workspace.findMany({
      include: {
        Member: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return workspace;
  } catch (error) {
    console.log(error);
  }
};

export const getWorkSpaceById = async (workspaceId: string) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        Member: true,
      },
    });
    return workspace;
  } catch (error) {
    console.log(error);
  }
};

export const edit_workspace = async ({
  name,
  description,
  workspaceId,
}: IWorkspace) => {
  try {
    const user = await getUser();

    if (!user?.id) {
      console.error("User is undefined in create_workspace");
      return;
    }

    const new_workspace = await prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        name,
        description,
      },
    });
    console.log(new_workspace);
    return new_workspace;
  } catch (error) {
    console.log(error);
  }
};

export const delete_Workspace = async (workspaceId: any) => {
  try {
    await prisma.workspace.delete({
      where: {
        id: workspaceId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
