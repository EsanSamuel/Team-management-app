"use server";

import { redirect } from "next/navigation";
import { $Enums } from "../generated/prisma";
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
      return
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
  try {
    const members = await prisma.member.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return members;
  } catch (error) {
    console.log(error);
  }
};

export const authorizeRole = async (
  userId: string,
  workspaceId: any,
  requiredRoles: $Enums.Role[]
) => {
  try {
    const member = await prisma.member.findFirst({
      where: {
        userId,
        workspaceId,
        role: { in: requiredRoles },
      },
    });
    return !!member;
  } catch (error) {
    console.log(error);
  }
};

export const editRole = async (memberId: string, role: "ADMIN" | "MEMBER") => {
  try {
    const editrole = await prisma.member.update({
      where: {
        id: memberId,
      },
      data: {
        role: role,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const remove_Member = async (memberId: any) => {
  try {
    await prisma.member.delete({
      where: {
        id: memberId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
