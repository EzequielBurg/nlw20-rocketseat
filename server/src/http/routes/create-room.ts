import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod/v4";
import { db } from "../../db/connection";
import { schema } from "../../db/schema";

export const createRoomRoute: FastifyPluginAsyncZod = async (app) => {
  app.post("/rooms", {
    schema: {
      body: z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      })
    }
  },
    async (request, reply) => {
      const { name, description } = request.body

      const result = await db.insert(schema.rooms)
        .values({ name, description, createdAt: new Date() })
        .returning()

      if (!result[0]) throw new Error('failed to create room')

      return reply.status(201).send({ roomId: result[0].id })
    }
  );
};
