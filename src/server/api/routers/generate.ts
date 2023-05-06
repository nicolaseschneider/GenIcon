import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Configuration, OpenAIApi } from 'openai';

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { env } from "~/env.mjs";

export const generateRouter = createTRPCRouter({
    generateIcon: protectedProcedure
    .input(
        z.object({
            prompt: z.string(),
        })
    )
    .mutation(async ({ ctx, input }) => {

        const configuration = new Configuration({
            apiKey: env.DALLE_API_KEY
        })
        const openai = new OpenAIApi(configuration);

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
        // FETCH REQ TO DALLE API
        console.log(results);

        const response = await openai.createImage({
            prompt: input.prompt,
            n: 1,
            size: '256x256',
            response_format: 'url',
        })
        .catch(e => {
            if (e.response) {
                console.log(e.response.status)
                console.log(e.response.data)
            } else {
                console.log(e.message)
            }
            
        })
        
        const url = response?.data.data[0]?.url;
        console.log({url})
        return {
            message:"Success",
            imageUrl: url,
        }
    })
});
