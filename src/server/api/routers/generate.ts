import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Configuration, OpenAIApi } from 'openai';

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { env } from "~/env.mjs";

const generateIcon = async (prompt: string, openai: OpenAIApi): Promise<string | void> => {
    if (env.MOCK_DALLE === 'true') {
        return 'https://static.vecteezy.com/system/resources/previews/018/764/128/original/chatgpt-logo-open-ai-icon-with-chatbot-artificial-intelligence-openai-chatbot-icon-chatgpt-openai-icon-artificial-intelligence-smart-ai-virtual-smart-assistant-bot-free-vector.jpg'
    } else {
        const response = await openai.createImage({
            prompt,
            n: 1,
            size: '256x256',
            response_format: 'url',
        })
        return response.data.data[0]?.url;
    }
}

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

       
        
        const url = await generateIcon(input.prompt, openai);
        console.log({url})
        return {
            message:"Success",
            imageUrl: url,
        }
    })
});
