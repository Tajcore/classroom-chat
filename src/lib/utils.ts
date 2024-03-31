import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}





export function createRoomLink(roomId: number, origin: string) {
  return `${origin}/room/${roomId}`
}