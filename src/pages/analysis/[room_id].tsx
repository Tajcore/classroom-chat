import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

const RoomAnalysis = () => {
  const router = useRouter();
  const { room_id } = router.query;

  const {
    data: room,
    error,
    isLoading,
  } = api.room.get.useQuery({ id: Number(room_id) });

  const { data: roomParticipantScores } =
    api.room.roomParticipantScores.useQuery({ id: Number(room_id) });

  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton />
      </div>
    );
  }

  if (error) {
    return <div className="p-4">Error: {error.message}</div>;
  }

  if (!room) {
    return <div className="p-4">Room not found</div>;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Dialog
        open={infoDialogOpen}
        onOpenChange={(value) => setInfoDialogOpen(value)}
      >
        <DialogContent className="max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conceptual Overview</DialogTitle>
            <DialogDescription>
              This page displays the analytics of the chatroom. The analytics
              are based on the participation of students in the chatroom. Below
              is the explanation of the scoring system:
            </DialogDescription>
          </DialogHeader>
          <div className="px-1 flex flex-col gap-4">
            <h1>Student Participation Grading Algorithm</h1>

            <section>
              <h2 className="text-semibold">Summarizing the Problem</h2>
              <p>
                The problem at hand involves analyzing a chat log to quantify
                student participation in an educational context. In online
                learning environments, it&apos;s crucial to have objective measures
                of student engagement. Our goal is to develop an algorithm that
                grades students based on the frequency of their contributions
                and their interactions with teachers, specifically responding to
                questions. This approach aims to encourage active participation
                and provide educators with a quantifiable measure of student
                involvement.
              </p>
            </section>

            <section>
              <h2 className="text-semibold">Problem Category</h2>
              <p>
                This algorithm operates within the realm of text analysis and
                pattern recognition, specifically tailored for educational
                technology applications. It interprets text data to identify
                meaningful interactions, such as questions and responses, and
                assigns scores to quantify participation.
              </p>
            </section>

            <section>
              <h2 className="text-semibold">Complexity Class</h2>
              <p>
                The problem belongs to the complexity class P, indicating that
                it can be solved within polynomial time relative to the input
                size. This classification suggests that our approach is feasible
                for real-world application, capable of processing chat logs
                efficiently to grade student participation.
              </p>
            </section>

            <section>
              <h2 className="text-semibold">Computational Means and Design Technique</h2>
              <p>
                Our computational strategy involves parsing chat log entries to
                detect messages from students and teachers, identifying
                questions posed by teachers, and recording student responses. We
                employ a linear pass-through of the chat log, leveraging data
                structures for efficient storage and retrieval of participation
                scores.
              </p>
            </section>

            <section>
              <h2 className="text-semibold">Algorithmic Design and Description</h2>
            </section>

            <section>
              <h2 className="text-semibold">Category of Chosen Algorithm</h2>
              <p>
                This algorithm falls under linear data processing algorithms. It
                makes a single pass through the chat log, updating participation
                scores based on the content and timing of messages, efficiently
                handling data without the need for multiple passes or complex
                operations.
              </p>
            </section>

            <section>
              <h2 className="text-semibold">Proof of Correctness</h2>
              <p>
                The algorithm&apos;s correctness can be established through
                induction:
                <ul>
                  <li>
                    <strong>Base case:</strong> At the start (no messages
                    processed), all scores are correctly initialized to 0.
                  </li>
                  <li>
                    <strong>Inductive step:</strong> Assuming correct scores up
                    to the \(n\)th message, the \((n+1)\)th message processing
                    correctly updates scores based on our criteria (10 points
                    for any message, 50 for answering a teacher&apos;s question).
                    This ensures the algorithm&apos;s correctness through each
                    iteration.
                  </li>
                </ul>
              </p>
            </section>

            <section>
              <h2 className="text-semibold">Analysis of Algorithms</h2>
              <p>
                <strong>Space Complexity:</strong> O(n), with n being the number
                of students. This stems from maintaining a participation score
                for each student.
              </p>
              <p>
                <strong>Time Complexity:</strong> O(m), where m is the number of
                messages. Each message is processed once, aligning the time
                complexity with the total messages.
              </p>
              <p>
                <strong>Insert and Update Operations:</strong> These are
                effectively O(1) when using a hash map for score tracking,
                demonstrating the algorithm&apos;s efficiency in updating
                participation scores.
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>
      <Card className="m-auto flex w-full max-w-6xl flex-col">
        <CardHeader className="flex flex-col gap-1">
          <CardTitle className="flex items-center justify-start gap-2">
            Chatroom Analytics{" "}
            <Info
              size={18}
              className="cursor-pointer text-red-500"
              onClick={() => setInfoDialogOpen(true)}
            />
          </CardTitle>
          <CardDescription>
            Student participation in the chatroom
          </CardDescription>
          <CardContent>
            <Table>
              <TableCaption>
                A list of students and their participation scores
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead className="text-left">Score (pts)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(roomParticipantScores ?? []).map((student) => (
                  <TableRow key={`student-${student.name}`}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};

export default RoomAnalysis;
