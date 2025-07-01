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
  users,
  projectId,
}: {
  content: string;
  users: any[];
  projectId: string;
}) => {
  try {
    const user = await getUser();

    if (!user?.id) {
      console.error("User is undefined");
      return;
    }
    console.log("Members:", users);
    const notification = await prisma.notification.create({
      data: {
        sender: {
          connect: {
            id: user?.id,
          },
        },
        content,

        project: {
          connect: {
            id: projectId,
          },
        },
      },
      include: {
        notificationUsers: true,
      },
    });

    await prisma.notificationUser.createMany({
      data: users.map((member) => ({
        userId: member.userId,
        notificationId: notification.id,
      })),
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

export const notificationWhenCommentisAddedToTask = async ({
  content,
  users,
  taskId,
  commentId,
}: {
  content: string;
  taskId: any;
  users: any[];
  commentId: string;
}) => {
  try {
    const user = await getUser();

    if (!user?.id) {
      console.error("User is undefined");
      return;
    }
    console.log("Members:", users);
    const notification = await prisma.notification.create({
      data: {
        sender: {
          connect: {
            id: user?.id,
          },
        },
        content,
        task: {
          connect: {
            id: taskId,
          },
        },
        comment: {
          connect: {
            id: commentId,
          },
        },
      },
      include: {
        notificationUsers: true,
      },
    });

    await prisma.notificationUser.createMany({
      data: users.map((member) => ({
        userId: member.userId,
        notificationId: notification.id,
      })),
    });
    console.log(notification);
    return notification;
  } catch (error) {
    console.log(error);
  }
};

export const notificationToMembersWhenSomeoneJoinsWorkspace = async ({
  workspaceId,
  users,
  content,
}: {
  workspaceId?: string;
  users: any[];
  content: string;
}) => {
  try {
    const user = await getUser();

    if (!user?.id) {
      console.error("User is undefined");
      return;
    }

    const members = users.filter((user) => user.userId !== user.id);
    const notification = await prisma.notification.create({
      data: {
        sender: {
          connect: {
            id: user?.id,
          },
        },
        workspace: {
          connect: {
            id: workspaceId,
          },
        },

        content,
      },
      include: {
        workspace: true,
      },
    });

    await prisma.notificationUser.createMany({
      data: users.map((member) => ({
        userId: member.userId,
        notificationId: notification.id,
      })),
    });
    console.log(notification);
    return notification;
  } catch (error) {
    console.log(error);
  }
};

export const getNotifications = async () => {
  try {
    const user = await getUser();
    if (!user?.id) {
      console.error("User is undefined");
      return [];
    }

    const allNotifications = await prisma.notification.findMany({
      orderBy: {
        sentAt: "desc",
      },
      include: {
        notificationUsers: true,
      },
    });
    console.log(allNotifications);

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          {
            receiverId: user.id,
          },
          {
            notificationUsers: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
      orderBy: {
        sentAt: "desc",
      },
      include: {
        notificationUsers: true,
        workspace: true,
      },
    });

    console.log("Count", notifications.length);
    console.log("Notifications:", notifications);
    return notifications;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
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
