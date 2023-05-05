import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const generateRouter = createTRPCRouter({
    generateIcon: protectedProcedure
    .input(
        z.object({
            prompt: z.string(),
        })
    )
    .mutation(async ({ ctx, input }) => {

        const results = await ctx.prisma.user.updateMany({
            where: {
                id: ctx.session.user.id,
                credits : {
                    gte: 1
                }
            },
            data: {
                credits: {
                    decrement: 1,
                }
            }
        })
        if (results.count <= 0) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Not enough credits',
            })
        }
        console.log(results);

        //

        
        return {
            message:"Success"
        }
    })
});
