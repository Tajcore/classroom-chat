import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";

import { api } from "@/utils/api";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LogOut,
  MessageCirclePlus,
  TriangleAlert,
  CircleDashed,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useRouter } from "next/router";
import { createRoomLink } from "@/lib/utils";
import { useState } from "react";
export default function Home() {
  return (
    <>
      <Head>
        <title>Utech Classroom Chatrooms - For Educators</title>
        <meta
          name="description"
          content="Foster collaboration and communication in the classroom with our easy-to-use chat platform. Teachers can create chatrooms for interactive discussions, and our analytical breakdown provides insights into student participation efforts."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-white to-[#000080] py-12 md:py-24   lg:py-32">
        <div className="container space-y-12 px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="py- inline-block rounded-lg px-3 text-7xl text-white">
                UChat Classrooms
              </div>
              <div className="inline-block rounded-lg bg-yellow-500 px-3 py-1 text-sm">
                For Educators
              </div>
              <h2 className="text-3xl font-bold tracking-tighter text-yellow-400 sm:text-5xl">
                Interactive Learning. Engaged Students.
              </h2>
              <p className="text-muted max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Foster collaboration and communication in the classroom with our
                easy-to-use chat platform. Teachers can create chatrooms for
                interactive discussions, and our analytical breakdown provides
                insights into student participation efforts.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <CreateClassroom />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

const formSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
});

function CreateClassroom() {
  const { data: sessionData } = useSession();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });
  const [linkClick, setLinkClick] = useState(false);
  const {
    mutate: createClassroom,
    data: classroomData,
    isPending,
    error,
    isSuccess,
  } = api.room.create.useMutation();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createClassroom(values);
  };

  const copyLink = async () => {
    if (classroomData) {
      await navigator.clipboard.writeText(
        createRoomLink(classroomData.id, window.location.origin),
      );
      setLinkClick(true);
    }
  };

  const { asPath } = useRouter();
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";
  const URL = `${origin}${asPath}`;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {!sessionData && (
          <span>Sign in as an Educator to create a Classroom</span>
        )}
      </p>
      <div className="flex flex-row gap-2">
        {sessionData ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="inline-flex h-10 items-center justify-between rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-blue-950 hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50">
                <MessageCirclePlus className="mr-2 h-5 w-5" />
                Create Classroom
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                {!isSuccess && <DialogTitle>Create Classroom</DialogTitle>}
                {!isSuccess && (
                  <DialogDescription>
                    Create a new classroom to start engaging with your students.
                  </DialogDescription>
                )}
              </DialogHeader>

              {!isSuccess ? (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid grid-cols-4 items-center gap-4"
                  >
                    {error && (
                      <div className="col-span-full">
                        <Alert variant="destructive">
                          <TriangleAlert className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>
                            There was an error creating the classroom. If the
                            problem persists, please contact support.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    <div className="col-span-full">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="CIT3003" {...field} />
                            </FormControl>
                            <FormDescription>
                              The name of the classroom
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-full">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Discussion on Asymptotic analysis"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A brief description of the classroom
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-full flex items-center justify-end">
                      <Button
                        type="submit"
                        className="flex items-center justify-start gap-2"
                      >
                        {isPending ? (
                          <>
                            <CircleDashed className="h-4 w-4 animate-spin" />
                            Creating Classroom
                          </>
                        ) : (
                          "Create Classroom"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="flex w-full flex-col items-center justify-center gap-2 p-4">
                  <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                      Classroom Created
                    </h1>
                    <p className="text-gray-500 md:text-xl/relaxed ">
                      Your classroom has been created. Share the link below with
                      your students.
                    </p>
                  </div>
                  <div className="w-full max-w-sm flex-col rounded-lg border">
                    <Input
                      className="h-10 rounded-t-none border-gray-200"
                      placeholder="Enter your email"
                      readOnly
                      type="text"
                      value={createRoomLink(classroomData?.id, URL)}
                    />
                    <Button
                      className="h-10 w-full rounded-t-none border-t-0 border-gray-200"
                      size="sm"
                      onClick={copyLink}
                    >
                      {linkClick ? "Copied!" : "Copy Link"}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            onClick={() => signIn("google")}
            className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-blue-950 hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
          >
            <MessageCirclePlus className="mr-2 h-5 w-5" />
            Sign in as Educator
          </Button>
        )}
        {sessionData && (
          <Button
            onClick={() => signOut()}
            className="inline-flex h-10 w-full max-w-md items-center justify-center rounded-md bg-gray-900 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-blue-950 hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sign out
          </Button>
        )}
      </div>
    </div>
  );
}
