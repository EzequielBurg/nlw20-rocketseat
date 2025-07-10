import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod/v4";
import { db } from "../../db/connection";
import { schema } from "../../db/schema";
import z4 from "zod/v4";

export const createQuestionRoute: FastifyPluginAsyncZod = async (app) => {
  app.post("/rooms/:roomId/questions", {
    schema: {
      params: z4.object({
        roomId: z4.string()
      }),
      body: z.object({
        question: z.string().min(1),
      })
    }
  },
    async (request, reply) => {
      const { roomId } = request.params
      const { question } = request.body

      const result = await db.insert(schema.questions)
        .values({ roomId, question, createdAt: new Date() })
        .returning()

      if (!result[0]) throw new Error('failed to create room')

      return reply.status(201).send({ roomId: result[0].id })
    }
  );
};
