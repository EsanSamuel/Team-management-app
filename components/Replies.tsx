"use client";
import { Comment, Reply, User } from "@/lib/generated/prisma";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { formatDistanceToNow } from "date-fns";
import { MessageSquareText, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";
import { Separator } from "./ui/separator";
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
  deletereply,
  editReply,
  getReplies,
} from "@/lib/actions/comment.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { notificationwhenSomeoneRepliesYou } from "@/lib/actions/notification.service";
import { getUser } from "@/lib/actions/user.service";

const Replies = ({
  commentId,
  taskId,
}: {
  commentId: string;
  taskId: string;
}) => {
  const [reply, setReply] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [replies, setReplies] = useState<
    (Reply & { user: User } & { comment: Comment & { user: User } })[]
  >([]);
  const [edit, setEdit] = useState("");
  const [user, setUser] = useState<User>();

  useEffect(() => {
    getReplies(commentId).then(setReplies as any);
    getUser().then(setUser as User | any);
  }, [commentId]);

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
    replyId: string,
    receiverId: string,
    reply: string,
    userId: string
  ) => {
    try {
      const notification = await notificationwhenSomeoneRepliesYou({
        receiverId: receiverId,
        replyId: replyId,
        senderId: userId,
        content: `You have been replied to by ${user?.username}. Reply: "${reply}"`,
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

  const handleReply = async (replyId: string, replyUserId: string) => {
    try {
      const create_Reply = await createReply({
        content: reply,
        images,
        commentId,
        taskId,
      });
      if (create_Reply) {
        notify(replyId, replyUserId, create_Reply.content, create_Reply.userId);
        console.log(replyId, replyUserId, create_Reply.content);
        toast.success("Reply created!");
        window.location.reload();
      }
    } catch (error) {
      console.group(error);
    }
  };

  const haneleEditReply = async (replyId: string) => {
    try {
      await editReply({ content: edit, replyId });
      toast.success("Comment edited!");
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {replies.map((reply, index) => (
        <div className="flex gap-2" key={reply.id}>
          <div className="relative flex flex-col items-center">
            <Avatar className="h-5 w-5 z-10">
              <AvatarImage src={reply.user.profilePicture!} />
              <AvatarFallback>{reply.user.username[0]}</AvatarFallback>
            </Avatar>
            {index !== replies.length - 1 && (
              <div className="absolute top-[20px] h-full w-px bg-gray-300 dark:bg-gray-600" />
            )}
          </div>
          <div className="flex flex-col gap-1 text-gray-600 dark:text-gray-300">
            <h1 className="text-gray-600 dark:text-gray-300 font-bold">
              {reply.user.username}{" "}
              <span className="font-light text-[12px] ml-3">
                {formatDistanceToNow(new Date(reply?.createdAt))} ago
              </span>
            </h1>
            <div>
              <p className={`text-gray-500 dark:text-gray-400 text-[13px] }`}>
                {reply.content}
              </p>
              {reply.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mt-3 xl:max-w-[500px] w-full">
                  {reply?.images.map((image, idx) => (
                    <a href={image} key={idx}>
                      <Image
                        src={image}
                        alt="images"
                        width={400}
                        height={400}
                        className="h-[120px] rounded-[10px] object-cover border "
                      />
                    </a>
                  ))}
                </div>
              ) : (
                ""
              )}
            </div>

            <div className="flex gap-2">
              <Dialog>
                <form>
                  <DialogTrigger asChild>
                    <h1 className="flex gap-1 items-center text-[13px] text-gray-600 dark:text-gray-300 mt-1 cursor-pointer">
                      <MessageSquareText size={13} />
                      Reply
                    </h1>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        Reply to {reply?.user?.username}
                      </DialogTitle>
                      <DialogDescription className="text-[12px]">
                        Make a reply to {reply?.user?.username}&apos;s comment.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="name-1">Reply</Label>
                        <Input
                          id="name-1"
                          name="comment"
                          onChange={(e) => setReply(e.target.value)}
                          defaultValue={`@${reply.user.username}.`}
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
                        onClick={() => handleReply(reply.id, reply.userId)}
                      >
                        Reply
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
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
                          onClick={() => setEdit(reply.content)}
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
                            onClick={() => haneleEditReply(reply.id)}
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
                        deletereply(reply.id);
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
      ))}
    </div>
  );
};

export default Replies;
