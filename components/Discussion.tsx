"use client";

import { Comment, User } from "@/lib/generated/prisma";
import React, { useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { formatDistanceToNow } from "date-fns";
import { MessageSquareText, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  createReply,
  deleteComment,
  editComment,
} from "@/lib/actions/comment.service";
import Replies from "./Replies";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { notificationwhenSomeoneRepliesToYourComment } from "@/lib/actions/notification.service";

const Discussion = ({
  comments,
  taskId,
}: {
  comments: (Comment & { user: User })[];
  taskId: string;
}) => {
  const [reply, setReply] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [showReply, setShowReply] = useState(false);
  const [edit, setEdit] = useState("");

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validImages: string[] = [];
    const fileReaders: FileReader[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.includes("image")) {
        toast.error("Only image files allowed!");
        return;
      }

      const reader = new FileReader();
      fileReaders.push(reader);
      reader.onload = () => {
        if (reader.result) {
          validImages.push(reader.result as string);
        }

        if (validImages.length === fileReaders.length) {
          setImages((prevImages) => [...prevImages, ...validImages]);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const notify = async (
    commentId: string,
    receiverId: string,
    user: User,
    reply: string
  ) => {
    try {
      const notification = await notificationwhenSomeoneRepliesToYourComment({
        receiverId: receiverId,
        commentId: commentId,
        senderId: user.id,
        content: `Your comment have been replied to by ${user?.username}. Reply: "${reply}"`,
      });
      if (notification) {
        console.log(
          `Your comment has been replied to by ${user?.username}. Reply: "${reply}"`
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleReply = async (commentId: string) => {
    try {
      const Reply = await createReply({
        content: reply,
        images,
        commentId,
        taskId,
      });
      toast.success("Reply created!");
      if (Reply) {
        notify(commentId, Reply.comment.userId, Reply.user, reply);
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const haneleEditComment = async (commentId: string) => {
    try {
      await editComment({ content: edit, commentId });
      toast.success("Comment edited!");
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-5 mt-10">
      {comments.map((comment, index) => (
        <div className="flex flex-col gap-2" key={comment.id}>
          <div className="flex gap-3 relative min-h-[60px]">
            {/* Avatar + connecting line */}
            <div className="relative flex flex-col items-center">
              <Avatar className="h-5 w-5 z-10">
                <AvatarImage src={comment.user.profilePicture!} />
                <AvatarFallback>{comment.user.username[0]}</AvatarFallback>
              </Avatar>
              {index !== comments.length - 1 && (
                <div className="absolute top-[20px] h-full w-px bg-gray-300 dark:bg-gray-600" />
              )}
            </div>

            {/* Comment content */}
            <div className="flex flex-col gap-1 text-gray-600 dark:text-gray-300">
              <h1 className="font-bold">
                {comment.user.username}
                <span className="font-light text-[12px] ml-3">
                  {formatDistanceToNow(new Date(comment?.createdAt))} ago
                </span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-[13px]">
                {comment.content}
              </p>

              {comment.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3 xl:max-w-[500px] w-full">
                  {comment.images.map((image, idx) => (
                    <a key={idx} href={image} target="_blank">
                      <Image
                        src={image}
                        alt="images"
                        width={400}
                        height={400}
                        className="h-[120px] rounded-[10px] object-cover border"
                      />
                    </a>
                  ))}
                </div>
              )}

              <div className="flex gap-3 items-center mt-3">
                <Dialog>
                  <form>
                    <DialogTrigger asChild>
                      <h1 className="flex gap-1 items-center text-[13px] text-gray-600 dark:text-gray-300 cursor-pointer">
                        <MessageSquareText size={13} />
                        Reply
                      </h1>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          Reply to {comment?.user?.username}
                        </DialogTitle>
                        <DialogDescription className="text-[12px]">
                          Make a reply to {comment?.user?.username}&apos;s
                          comment.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div className="grid gap-3">
                          <Label htmlFor="name-1">Reply</Label>
                          <Input
                            id="name-1"
                            name="comment"
                            onChange={(e) => setReply(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="username-1">
                            Images{" "}
                            <span className="font-light text-[11px]">
                              Optional
                            </span>
                          </Label>
                          <Input
                            id="username-1"
                            type="file"
                            onChange={handleImages}
                            multiple
                          />
                          {images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                              {images.map((image, idx) => (
                                <Image
                                  src={image}
                                  key={idx}
                                  alt="images"
                                  width={400}
                                  height={400}
                                  className="h-[120px] rounded-[10px]"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          onClick={() => handleReply(comment.id)}
                        >
                          Reply
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </form>
                </Dialog>
                <Badge
                  className="cursor-pointer"
                  onClick={() => setShowReply(!showReply)}
                >
                  {showReply ? "Hide Replies" : "Show Replies"}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 dark:text-gray-300"
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <Dialog>
                      <form>
                        <DialogTrigger asChild>
                          <h1
                            className="text-[13px] px-2 hover:opacity-50 cursor-pointer"
                            onClick={() => setEdit(comment.content)}
                          >
                            Edit Comment
                          </h1>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit Comment</DialogTitle>
                            <DialogDescription className="text-[12px]">
                              Make changes to your comment here. Click save when
                              you&apos;re done.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4">
                            <div className="grid gap-3">
                              <Label htmlFor="name-1">Comment</Label>
                              <Input
                                id="name-1"
                                name="name"
                                onChange={(e) => setEdit(e.target.value)}
                                value={edit}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              type="submit"
                              onClick={() => haneleEditComment(comment.id)}
                            >
                              Edit
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </form>
                    </Dialog>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Button
                        variant="outline"
                        onClick={() => {
                          deleteComment(comment.id);
                          toast.success("Comment deleted!");
                        }}
                        className="bg-red-400 hover:bg-red-500 dark:bg-red-400 dark:hover:bg-red-500 hover:text-white text-white mt-1 flex gap-2 items-center"
                      >
                        <Trash2 /> Delete Task
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {showReply && (
            <div className="pl-10">
              <Replies commentId={comment?.id} taskId={taskId as any} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Discussion;
