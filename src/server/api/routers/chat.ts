import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const chatRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                content: z.string(),
                roomId: z.number(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const chat = ctx.db.message.create({
                data: {
                    content: input.content,
                    createdBy: {
                        connect: {
                            id: ctx.session.user.id,
                        },
                    },
                    room: {
                        connect: {
                            id: input.roomId,
                        },
                    },
                },
            });
            return chat;
        }),
    get: publicProcedure
        .input(z.object({ roomId: z.number() }))
        .query(async ({ ctx, input }) => {
            const chats = ctx.db.message.findMany({
                where: {
                    roomId: input.roomId,
                },
                include: {
                 createdBy: true,
                },
            });
            return chats;
        }),


});
