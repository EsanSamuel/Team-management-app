"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "@/lib/actions/notification.service";
import { getUser } from "@/lib/actions/user.service";
import {
  Notification as Notifications,
  Project,
  Task,
  User,
  Workspace,
} from "@/lib/generated/prisma";
import { CheckCheck, Dot, SquareDot } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from "next/navigation";

const Notification = () => {
  const { workspaceId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User>();
  const [notifications, setNotifications] = useState<
    (Notifications & { user: User } & { task: Task } & {
      project: Project & { workspace: Workspace };
    })[]
  >([]);
  useEffect(() => {
    getUser().then(setUser as any);
  }, []);

  useEffect(() => {
    if (user) {
      getNotifications(user.id).then(setNotifications as any);
    }
  }, [user, user?.id]);

  const markAllAs_Read = async () => {
    try {
      await markAllAsRead(user?.id as string);
      toast.success("All notifications are mark as read!");
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const unReadNotifications = notifications.filter(
    (notification) => notification.isRead === false
  );

  const viewTask = (notification: Notifications) => {
    if (notification?.taskId) {
      router.push(
        `/dashboard/${workspaceId}/TaskContent/${notification.taskId}`
      );
    }
  };

  return (
    <div className="xl:p-10 p-3">
      <div className="flex mb-5 xl:justify-between flex-col gap-2 md:flex-row md:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-[16px] flex gap-2 items-center">
            Notifications{" "}
            {unReadNotifications.length > 0 && (
              <Badge
                className="h-5 min-w-5 rounded-full px-1 tabular-nums"
                variant="destructive"
              >
                {unReadNotifications.length}
              </Badge>
            )}
          </h1>
          <p className="text-gray-500 text-[12px] dark:text-gray-400">
            See all notifications here.
          </p>
        </div>
        <Button onClick={markAllAs_Read} className="flex items-center">
          <CheckCheck />
          Mark all as read
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {notifications.map((notification) => (
          <Card className="shadow-none px-3" key={notification?.id}>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Checkbox
                  checked={notification.isRead === true}
                  onCheckedChange={() => {
                    markAsRead(notification.id);
                    toast.success("Notification mark as read!");
                    window.location.reload();
                  }}
                  aria-label="Select row"
                />
                <div className="flex flex-col gap-0">
                  <h1 className="text-gray-600 dark:text-gray-300 text-[13px] truncate max-w-[160px] sm:max-w-[200px] md:max-w-[300px] lg:max-w-[80%] ">
                    {notification?.content}
                  </h1>
                  {notification?.sentAt && (
                    <p className="font-light text-gray-600 dark:text-gray-400 text-[10px] flex gap-1 items-center ">
                      {" "}
                      {format(
                        new Date(notification?.sentAt),
                        "MMMM do, yyyy"
                      )}{" "}
                      <Dot />
                      <span>
                        {formatDistanceToNowStrict(
                          new Date(notification?.sentAt)
                        )}{" "}
                        ago
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button
                    className="bg-input/30 border text-gray-600 dark:text-gray-300"
                    onClick={() => markAsRead(notification.id)}
                  >
                    View
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Notification </AlertDialogTitle>
                    <AlertDialogDescription className="text-[13px]">
                      {notification?.content}
                      <p className="mt-2 font-light text-gray-600 dark:text-gray-400 text-[10px] flex gap-1 items-center ">
                        Sent{" "}
                        {formatDistanceToNowStrict(
                          new Date(notification.sentAt)
                        )}{" "}
                        ago
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {notification.taskId && (
                      <AlertDialogAction
                        className=""
                        onClick={() => viewTask(notification)}
                      >
                        View Task
                      </AlertDialogAction>
                    )}
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Notification;
