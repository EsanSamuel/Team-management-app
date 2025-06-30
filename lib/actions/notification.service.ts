"use server";
import { getUser } from "./user.service";
import { v2 as cloudinary } from "cloudinary";
import prisma from "../prismadb";
import { connect } from "http2";

/**
 */
export const notificationWhenAssignedTask = async ({
  taskId,
  senderId,
  receiverId,
  content,
}: {
  taskId?: string;
  senderId?: string;
  receiverId?: string;
  content: string;
}) => {
  try {
    const user = await getUser();

    if (!user?.id) {
      console.error("User is undefined in create_workspace");
      return;
    }
    const notification = await prisma.notification.create({
      data: {
        task: {
          connect: {
            id: taskId as string,
          },
        },
        receiver: {
          connect: {
            id: receiverId as string,
          },
        },
        content,
        sender: {
          connect: {
            id: senderId,
          },
        },
      },
      include: {
        task: true,
        project: true,
        sender: true,
        receiver: true,
      },
    });
    console.log(notification);
    return notification;
  } catch (error) {
    console.log(error);
  }
};

export const notificationWhenAddedOrRemovedToWorkspace = async ({
  workspaceId,
  senderId,
  receiverId,
  content,
}: {
  workspaceId?: string;
  senderId?: string;
  receiverId?: string;
  content: string;
}) => {
  try {
    if (!senderId || !receiverId || !workspaceId) {
      console.error("Missing IDs:", { senderId, receiverId, workspaceId });
      return;
    }
    const notification = await prisma.notification.create({
      data: {
        workspace: {
          connect: {
            id: workspaceId,
          },
        },
        receiver: {
          connect: {
            id: receiverId,
          },
        },
        content,
        sender: {
          connect: {
            id: senderId,
          },
        },
      },
      include: {
        task: true,
        project: true,
        sender: true,
        receiver: true,
        workspace: true,
      },
    });
    console.log(notification);
    return notification;
  } catch (error) {
    console.log(error);
  }
};

export const notificationWhenNewProjectIsAdded = async ({
  content,
  receiverId,
  projectId,
}: {
  content: string;
  receiverId: string;
  projectId: string;
}) => {
  try {
    const user = await getUser();

    if (!user?.id) {
      console.error("User is undefined");
      return;
    }
    const notification = await prisma.notification.create({
      data: {
        sender: {
          connect: {
            id: user?.id,
          },
        },
        content,
        receiver: {
          connect: {
            id: receiverId,
          },
        },
        project: {
          connect: {
            id: projectId,
          },
        },
      },
    });
    console.log(notification);
    return notification;
  } catch (error) {
    console.log(error);
  }
};

export const notificationWhenRoleChanged = async ({
  senderId,
  receiverId,
  content,
}: {
  senderId?: string;
  receiverId?: string;
  content: string;
}) => {
  try {
    const user = await getUser();

    if (!user?.id) {
      console.error("User is undefined in create_workspace");
      return;
    }
    console.log(receiverId);
    const notification = await prisma.notification.create({
      data: {
        receiver: {
          connect: {
            id: receiverId as string,
          },
        },
        content,
        sender: {
          connect: {
            id: senderId,
          },
        },
      },
      include: {
        project: true,
        sender: true,
        receiver: true,
      },
    });
    console.log(notification);
    return notification;
  } catch (error) {
    console.log(error);
  }
};

export const getNotifications = async (receiverId: string) => {
  try {
    const notification = await prisma.notification.findMany({
      where: {
        receiverId,
      },
      orderBy: {
        sentAt: "desc",
      },
    });
    console.log(notification);
    return notification;
  } catch (error) {
    console.log(error);
  }
};

export const markAsRead = async (notificationId: string) => {
  try {
    await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const markAllAsRead = async (receiverId: string) => {
  try {
    await prisma.notification.updateMany({
      where: {
        receiverId,
      },
      data: {
        isRead: true,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
