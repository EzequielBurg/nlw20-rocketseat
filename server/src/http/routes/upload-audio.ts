import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection";
import { schema } from "../../db/schema";
import z4 from "zod/v4";
import { generateEmbeddings, transcribeAudio } from "../../services/gemini";

export const uploadAudioRoute: FastifyPluginAsyncZod = async (app) => {
  app.post("/rooms/:roomId/audio", {
    schema: {
      params: z4.object({
        roomId: z4.string()
      }),
    }
  },
    async (request, reply) => {
      const { roomId } = request.params
      const audio = await request.file()
      if (!audio) throw new Error('Audio is required')


      const audioBuffer = await audio.toBuffer()
      const audioBase64 = audioBuffer.toString('base64')

      const transcription = await transcribeAudio(audioBase64, audio.mimetype)
      const embeddings = await generateEmbeddings(transcription)

      const result = await db.insert(schema.audioChunks).values({
        roomId,
        transcription,
        embeddings,
      }).returning()

      const chunk = result[0]

      if (!chunk) throw new Error('error on save audio chunk')

      return reply.status(201).send({ chunkId: chunk.id })
    }
  );
};
