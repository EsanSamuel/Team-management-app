"use server";
import { getUser } from "./user.service";
import prisma from "../prismadb";
import { Project, Task, User } from "../generated/prisma";
import { redirect } from "next/navigation";

export const createTask = async ({
  title,
  description,
  Status,
  priority,
  Duedate,
  assignedTo,
  projectId,
  workspaceId,
}: {
  title: string;
  description: string;
  Status: string;
  projectId: string;
  priority: string;
  Duedate: Date | string;
  assignedTo: string;
  workspaceId: any;
}) => {
  try {
    const user = await getUser();

    if (!user?.id) {
      console.error("User is undefined in create_workspace");
      return;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        Status,
        priority,
        Duedate: new Date(Duedate),
        assignee: {
          connect: {
            id: assignedTo,
          },
        },
        project: {
          connect: {
            id: projectId,
          },
        },
        creator: {
          connect: {
            id: user?.id,
          },
        },
        workspace: {
          connect: {
            id: workspaceId,
          },
        },
      },
      include: {
        project: true,
        workspace: true,
      },
    });
    console.log(task);
    return task;
  } catch (error) {
    console.log(error);
  }
};

export const getTasks = async (
  projectId: string
): Promise<(Task & { assignee: User } & { project: Project })[]> => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        assignee: true,
        project: true,
        workspace: true,
      },
      orderBy: {
        Duedate: "asc",
      },
    });
    console.log("Tasks:", tasks);
    return tasks;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getTask = async (
  taskId: string
): Promise<(Task & { assignee: User } & { project: Project }) | undefined> => {
  try {
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        assignee: true,
        project: true,
        workspace: true,
      },
    });
    console.log("Tasks:", task);
    return task ?? undefined;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const getAllTasksInWorkspace = async (
  workspaceId: string
): Promise<(Task & { assignee: User } & { project: Project })[]> => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        assignee: true,
        project: true,
        workspace: true,
      },
      orderBy: {
        Duedate: "asc",
      },
    });
    console.log("Tasks:", tasks);
    return tasks;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const editTask = async ({
  title,
  description,
  Status,
  priority,
  Duedate,
  assignedTo,
  projectId,
  taskId,
  workspaceId,
}: {
  taskId: any;
  title: string;
  description: string;
  Status: string;
  projectId: string;
  priority: string;
  Duedate: string | Date;
  assignedTo: string;
  workspaceId: any;
}) => {
  try {
    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        title,
        description,
        Status,
        priority,
        Duedate: new Date(Duedate),
        project: {
          connect: {
            id: projectId,
          },
        },
        assignee: {
          connect: {
            id: assignedTo,
          },
        },
        workspace: {
          connect: {
            id: workspaceId,
          },
        },
      },
    });
    console.log(task);
    return task;
  } catch (error) {
    console.log(error);
  }
};

export const delete_Task = async (taskId: any) => {
  try {
    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
