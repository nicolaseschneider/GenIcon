import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Configuration, OpenAIApi } from 'openai';
import { base64EncodedImage } from "./mocks/base64image";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import AWS from 'aws-sdk'
import { env } from "~/env.mjs";


const s3 = new AWS.S3({
    credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
    }
})
const generateIcon = async (prompt: string, openai: OpenAIApi): Promise<string | undefined> => {
    if (env.MOCK_DALLE === 'true') {
        return base64EncodedImage; 
    } else {
        const response = await openai.createImage({
            prompt,
            n: 1,
            size: '256x256',
            response_format: "b64_json",
        })
        return response.data.data[0]?.b64_json;
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
        const base64Image = await generateIcon(input.prompt, openai);
        console.log(base64Image);

        await s3
            .putObject({
                Bucket: 'genicon',
                Body: Buffer.from(base64Image!, 'base64'),
                Key: 'zzz', //generate random id;
                ContentEncoding: "base64",
                ContentType: "image/gif",
            })
            .promise();


        return {
            message:"Success",
            imageUrl: base64Image,
        }
    })
});
