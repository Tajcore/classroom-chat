import { type Message, type User } from "@prisma/client";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}





export function createRoomLink(roomId: number, origin: string) {
  return `${origin}/room/${roomId}`
}




interface ChatMessage {
  name: string;
  role: "Teacher" | "Student";
  timestamp: Date;
  messageContent: string;
}

type ParticipationScore = Record<string, number>;


export function gradeParticipation(chatLog: ChatMessage[]): ParticipationScore {
  console.log(chatLog);
  const scores: ParticipationScore = {};
  let lastTeacherQuestionTime: Date | null = null;

  chatLog.forEach((message) => {
    // Initialize student score if it does not exist
    if (message.role === "Student" && !(message.name in scores)) {
      scores[message.name] = 0;
    }

    // Check if the message is a question from the teacher
    if (message.role === "Teacher" && message.messageContent.trim().endsWith("?")) {
      lastTeacherQuestionTime = message.timestamp;
    }

    // Scoring student participation
    if (message.role === "Student") {
      scores[message.name] += 10; // 10 points for sending a message

      // 50 points for responding to a teacher's question
      if (lastTeacherQuestionTime && message.timestamp > lastTeacherQuestionTime) {
        scores[message.name] += 50;
        lastTeacherQuestionTime = null; // Reset lastTeacherQuestionTime to ensure a response is only counted once
      }
    }
  });

  return scores;
}


export function convertChatObjectsToChatLog(chats: { id: number; content: string; createdAt: Date; updatedAt: Date; roomId: number; userId: string; } [], teacherId: string): ChatMessage[] {
  const chatLog: ChatMessage[] = [];

  chats.forEach((chat) => {
    chatLog.push({
      // @ts-ignore
      name: chat.createdBy.name ?? "Anonymous",
      role: chat.userId === teacherId ? "Teacher" : "Student",
      timestamp: chat.createdAt,
      messageContent: chat.content,
    });
  });

  return chatLog;
}