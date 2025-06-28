"use server";
import { getUser } from "./user.service";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createComment = async ({
  taskId,
  content,
  images,
}: {
  taskId: string | any;
  content: string;
  images: string[];
}) => {
  try {
    const user = await getUser();

    if (!user?.id) {
      console.error("User is undefined");
      return;
    }

    const imageUrls = [];

    if (Array.isArray(images)) {
      for (const image of images) {
        const url = await cloudinary.uploader.upload(image);
        imageUrls.push(url.url);
      }
    }

    const comment = await prisma?.comment.create({
      data: {
        user: {
          connect: {
            id: user?.id,
          },
        },
        task: {
          connect: {
            id: taskId,
          },
        },
        images: imageUrls,
        content,
      },
    });
    console.log(comment);
    return comment;
  } catch (error) {
    console.log(error);
  }
};

export const getComments = async (taskId: string) => {
  try {
    const comments = await prisma?.comment.findMany({
      where: {
        taskId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return comments;
  } catch (error) {
    console.log(error);
  }
};

export const getComment = async (commentId: string) => {
  try {
    const comments = await prisma?.comment.findMany({
      where: {
        id: commentId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return comments;
  } catch (error) {
    console.log(error);
  }
};

export const getReplies = async (commentId: string) => {
  try {
    const comments = await prisma?.reply.findMany({
      where: {
        commentId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return comments;
  } catch (error) {
    console.log(error);
  }
};

export const getReply = async (replyId: string) => {
  try {
    const comments = await prisma?.reply.findMany({
      where: {
        id: replyId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return comments;
  } catch (error) {
    console.log(error);
  }
};

export const createReply = async ({
  taskId,
  content,
  images,
  commentId,
}: {
  taskId: string | any;
  content: string;
  images: string[];
  commentId: string;
}) => {
  try {
    const user = await getUser();

    if (!user?.id) {
      console.error("User is undefined");
      return;
    }

    const imageUrls = [];

    if (Array.isArray(images)) {
      for (const image of images) {
        const url = await cloudinary.uploader.upload(image);
        imageUrls.push(url.url);
      }
    }

    const comment = await prisma?.reply.create({
      data: {
        user: {
          connect: {
            id: user?.id,
          },
        },
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
        images: imageUrls,
        content,
      },
    });
    console.log(comment);
    return comment;
  } catch (error) {
    console.log(error);
  }
};

export const editComment = async ({
  content,
  commentId,
}: {
  content: string;
  commentId: string;
}) => {
  try {
    const user = await getUser();

    if (!user?.id) {
      console.error("User is undefined");
      return;
    }

    const comment = await prisma?.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content,
      },
    });
    console.log(comment);
    return comment;
  } catch (error) {
    console.log(error);
  }
};

export const deleteComment = async (commentId: string) => {
  try {
    await prisma?.reply.deleteMany({
      where: { commentId },
    });

    // Then delete comment
    await prisma?.comment.delete({
      where: { id: commentId },
    });
  } catch (error) {
    console.log(error);
  }
};

export const editReply = async ({
  content,
  replyId,
}: {
  content: string;
  replyId: string;
}) => {
  try {
    const user = await getUser();

    if (!user?.id) {
      console.error("User is undefined");
      return;
    }

    const comment = await prisma?.reply.update({
      where: {
        id: replyId,
      },
      data: {
        content,
      },
    });
    console.log(comment);
    return comment;
  } catch (error) {
    console.log(error);
  }
};

export const deletereply = async (replyId: string) => {
  try {
    await prisma?.reply.delete({
      where: {
        id: replyId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
