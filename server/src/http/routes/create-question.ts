import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod/v4";
import { db } from "../../db/connection";
import { schema } from "../../db/schema";
import z4 from "zod/v4";
import { generateAnswer, generateEmbeddings } from "../../services/gemini";
import { and, eq, sql } from "drizzle-orm";

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

      const embeddings = await generateEmbeddings(question)

      const embeddingsString = `[${embeddings.join(',')}]`

      const chunks = await db.select({
        id: schema.audioChunks.id,
        transcription: schema.audioChunks.transcription,
        similarity: sql<number>`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsString}::vector)`
      })
        .from(schema.audioChunks)
        .where(
          and(eq(schema.audioChunks.id, roomId),
          sql`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsString}::vector) > 0.7`
        ))
        .orderBy(sql`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsString}::vector) > 0.7`)
        .limit(3)

      let answer: string | null = null


      if (chunks.length > 0) {
        const transcriptions = chunks.map(chunk => chunk.transcription)

        answer = await generateAnswer(question, transcriptions)
      }

      const result = await db.insert(schema.questions)
        .values({ roomId, question, answer })
        .returning()

      if (!result[0]) throw new Error('failed to create room')

      return reply.status(201).send({ questionId: result[0].id, answer })
    }
  );
};
