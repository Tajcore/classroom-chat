"use client";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { CardContent, Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { type Message, type User } from "@prisma/client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { CircleDashed } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";

const formSchema = z.object({
  content: z.string(),
});

const ChatRoom = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const { id } = router.query;
  const {
    data: roomData,
    error,
    isLoading,
  } = api.room.get.useQuery({ id: Number(id) });

  const { data: chatData } = api.chat.get.useQuery({
    roomId: Number(id),
  });

  const { data: roomParticipants } = api.room.roomParticipants.useQuery({
    id: Number(id),
  });

  const { data: sessionData } = useSession();

  const { mutate: sendMessage, isPending: isSendingMessage } =
    api.chat.create.useMutation();

  const {
    mutate: endClass,
    isPending: roomEnding,
    isSuccess: roomEndingSuccessful,
  } = api.room.endRoom.useMutation();

  const handleEndRoom = () => {
    endClass({ roomId: Number(id) });
  };

  const handleSendMessage = async (values: z.infer<typeof formSchema>) => {
    sendMessage(
      {
        content: values.content,
        roomId: Number(id),
      },
      {
        onSuccess: (data) => {
          form.reset();
          scrollToBottomOfChat();
          // @ts-expect-error - ts-expect-error
          setMessages((prev) => [...prev, data]);
        },
      },
    );
  };

  const scrollToBottomOfChat = () => {
    ref.current?.scrollTo({
      top: ref.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [endRoomDialog, setEndRoomDialog] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const loggedIn = !!sessionData?.user;

  useEffect(() => {
    if (chatData) {
      setMessages(chatData);
    }
  }, [chatData]);
  if (error) return <div>failed to load</div>;
  if (isLoading)
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Card className="m-auto w-full max-w-3xl">
          <div className="flex h-[600px] flex-col">
            <CardContent className="flex flex-col items-center justify-center space-y-2 p-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
            <CardContent className="max-h-[400px] flex-1 p-0">
              <div className="grid h-full">
                <div className="flex h-full flex-col border-t border-gray-200">
                  <div className="border-b border-gray-200 p-4 ">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-10 w-10 rounded-full bg-gray-100 ">
                        <Avatar>
                          <AvatarImage src="https://randomuser.me/api/portraits" />
                          <AvatarFallback />
                        </Avatar>
                      </div>
                      <div className="grid gap-0.5">
                        <div className="flex flex-col items-start justify-start gap-1">
                          <div className="flex flex-row items-center justify-start gap-2">
                            <Skeleton className="h-4 w-24" />
                            <span className="h-3 w-3 animate-pulse rounded-full bg-green-400" />
                          </div>
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-full max-h-[300px] flex-1 flex-col gap-4 overflow-y-auto p-4"></div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    );

  return (
    <>
      {roomData?.active === false && (
        <div className="flex h-screen flex-col items-center justify-center">
          <Card className="m-auto w-full max-w-3xl">
            <CardContent className="flex flex-col items-center justify-center space-y-2 p-6">
              <h1 className="text-2xl font-bold">Room Ended</h1>
              <p className="text-sm text-gray-500 ">
                {roomData.createdBy.id === sessionData?.user?.id
                  ? "You have ended this chat session"
                  : "The room has been ended by the teacher"}
              </p>
            </CardContent>
            <CardFooter className="flex flex-row gap-2">
              {roomData?.createdBy?.id === sessionData?.user?.id && (
                <Button
                  variant="destructive"
                  onClick={() => router.push("/analysis/" + id?.toString())}
                  className="w-full"
                >
                  Get Participation Analytics
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => void signOut()}
                className="w-full"
              >
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      {roomData?.active === true && (
        <div className="flex h-screen flex-col items-center justify-center">
          <AlertDialog open={!loggedIn}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign in to send messages</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>
                You need to sign in to send messages. Click the button below to
                sign in.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => void signIn("azure-ad")}>
                  Sign in
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog open={endRoomDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End Room</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>
                Are you sure you want to end the room? This action is
                irreversible.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => void handleEndRoom()}>
                  {roomEnding ? (
                    <>
                      <CircleDashed className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Ending Room</span>
                    </>
                  ) : roomEndingSuccessful ? (
                    "Room Ended"
                  ) : (
                    "End Session"
                  )}
                </AlertDialogAction>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Card className="m-auto w-full max-w-3xl">
            <div className="flex h-[600px] flex-col">
              <CardContent className="flex flex-col items-center justify-center space-y-2 p-6">
                <h1 className="text-2xl font-bold">{roomData?.name}</h1>
                <p className="text-sm text-gray-500 ">
                  {roomData?.description ?? "No description"}
                </p>
                <h4 className="text-xs text-gray-500 ">
                  Created{" "}
                  {format(roomData?.createdAt ?? new Date(), "MMM dd, yyyy")}
                </h4>
              </CardContent>
              <CardContent className="max-h-[400px] flex-1 p-0">
                <div className="grid h-full">
                  <div className="flex h-full flex-col border-t border-gray-200">
                    <div className="border-b border-gray-200 p-4 ">
                      <div className="flex items-center space-x-4">
                        <div className="relative h-10 w-10 rounded-full bg-gray-100 ">
                          <Avatar>
                            <AvatarImage src="https://randomuser.me/api/portraits" />
                            <AvatarFallback>
                              {roomData?.createdBy?.name
                                ? roomData.createdBy.name[0]
                                : ""}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="grid gap-0.5">
                          <div className="flex flex-col items-start justify-start gap-1">
                            <div className="flex flex-row items-center justify-start gap-2">
                              <h3 className="text-sm font-medium leading-none">
                                {roomData?.createdBy?.name}
                              </h3>
                              <span className="h-3 w-3 animate-pulse rounded-full bg-green-400" />
                            </div>
                            <p className="text-xs text-gray-500">Teacher</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex h-full max-h-[300px] flex-1 flex-col gap-y-1 overflow-y-auto p-4"
                      ref={ref}
                    >
                      {messages.map((message) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          roomCreaterId={roomData?.createdBy?.id ?? ""}
                        />
                      ))}
                    </div>
                    <div className="border-t border-gray-200 p-4">
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(handleSendMessage)}
                          className="sticky bottom-0 flex items-center justify-between gap-2"
                        >
                          <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormControl>
                                  <Input
                                    className="w-full"
                                    placeholder="Type a message"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="submit"
                            className="flex flex-row items-center"
                          >
                            {isSendingMessage ? (
                              <>
                                <CircleDashed className="h-4 w-4 animate-spin" />
                                <span className="ml-2">Sending</span>
                              </>
                            ) : (
                              "Send"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
          <Card className="m-auto w-full max-w-3xl">
            <CardContent className="flex w-full flex-col items-center justify-center space-y-2 p-6">
              <h1 className="text-2xl font-bold">Room Participants</h1>
              <div className="flex w-full flex-col items-center justify-center space-y-2">
                {roomParticipants?.map((user) => (
                  <div
                    key={user.id}
                    className="flex w-full  items-start justify-between gap-4 p-2"
                  >
                    <div className="flex items-center justify-start gap-2">
                      <div className="relative h-10 w-10 rounded-full bg-gray-100 ">
                        <Avatar>
                          <AvatarImage src="https://randomuser.me/api/portraits" />
                          <AvatarFallback>
                            {user.name ? user.name[0] : ""}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-medium text-gray-600">
                          {user.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {user.id.toString() === roomData?.createdBy?.id
                            ? "Teacher"
                            : "Student"}{" "}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-row gap-2">
              {roomData?.createdBy?.id === sessionData?.user?.id && (
                <Button
                  variant="destructive"
                  onClick={() => setEndRoomDialog(true)}
                  className="w-full"
                >
                  End Session
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => void signOut()}
                className="w-full"
              >
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
};

type MessageWithUser = Message & {
  createdBy: User;
};

type ChatMessageProps = {
  message: MessageWithUser;
  roomCreaterId: string;
};

const ChatMessage = (props: ChatMessageProps) => {
  const { message, roomCreaterId } = props;
  const { data: sessionData } = useSession();
  const isCurrentUser = message.userId === sessionData?.user?.id;
  const calculateRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return format(date, "MMM dd, yyyy hh:mm a");
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };
  return (
    <div className="flex items-start">
      <div className="flex-1">
        {!isCurrentUser ? (
          <div
            className={`grid grid-cols-12 items-center justify-start rounded-lg bg-blue-50 
         p-4`}
          >
            <div className="relative col-span-1 h-10 w-10 rounded-full bg-gray-100 ">
              <Avatar>
                <AvatarImage src="https://randomuser.me/api/portraits" />
                <AvatarFallback>
                  {message.createdBy.name ? message.createdBy.name[0] : ""}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="col-span-11">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">
                  {message.createdBy.name}{" "}
                  {message.createdBy.id === roomCreaterId ? "(Teacher)" : ""}
                </h3>
                <span className="text-xs text-gray-500">
                  {calculateRelativeTime(message.createdAt)}
                </span>
              </div>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ) : (
          <div
            className={`grid grid-cols-12 items-center justify-end rounded-lg bg-yellow-50 
         p-4`}
          >
            <div className="col-span-full">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">You</h3>
                <span className="text-xs text-gray-500">
                  {calculateRelativeTime(message.createdAt)}
                </span>
              </div>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
