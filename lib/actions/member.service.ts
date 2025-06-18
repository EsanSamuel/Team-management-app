"use server";

import prisma from "../prismadb";
import { getUser } from "./user.service";

export const AddUserToWorkspace = async (
  workspaceId: string,
  role: "ADMIN" | "OWNER" | "MEMBER"
): Promise<void> => {
  try {
    const user = await getUser();

    if (!user?.id) {
      console.error("User is undefined in create_workspace");
      return;
    }
    const member = await prisma.member.create({
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
        role,
      },
    });
    console.log(member);
  } catch (error) {
    console.log(error);
  }
};

export const getMembers = async (workspaceId: string) => {
  const user = await getUser();

  if (!user?.id) {
    console.error("User is undefined in create_workspace");
    return;
  }
  try {
    const members = await prisma.member.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        user: true,
      },
    });
    return members;
  } catch (error) {
    console.log(error);
  }
};
