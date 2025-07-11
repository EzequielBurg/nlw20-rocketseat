import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection";
import { schema } from "../../db/schema";
import { count, eq } from "drizzle-orm";

export const getRoomsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get("/rooms", async () => {
    try {
      const results = await db
        .select({
          id: schema.rooms.id,
          name: schema.rooms.name,
          questionsCount: count(schema.questions.id),
          createdAt: schema.rooms.createdAt
        })
        .from(schema.rooms)
        .leftJoin(schema.questions, eq(schema.questions.roomId, schema.rooms.id))
        .groupBy(schema.rooms.id)
        .orderBy(schema.rooms.createdAt);

      return results;
    } catch (error) {
      console.log(error);
    }
  });
};
