import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const roomRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const room = ctx.db.room.create({
        data: {
          name: input.title,
          description: input.description,
          createdBy: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
      return room;
    }),
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const room = ctx.db.room.findUnique({
        where: {
          id: input.id,
        },
        include: {
          createdBy: true,
          chats: {
            include: {
              createdBy: true,
            },
          }
        },
      });
      return room;
    }),
});
