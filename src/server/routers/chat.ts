import { z } from "zod";
import { procedure, router } from "../trpc";
import sql from "@/utils/db";

export const chatRouter = router({
  sendMessage: procedure
    .input(
      z.object({
        text: z.string().min(1).max(255),
        name: z.string().min(1).max(25),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      let color = input.color || "white";
      color = color === "stars" ? "yellow" : color !== "blue" ? color : "cyan";
      await sql`INSERT INTO chat (name, text, color) VALUES (${input.name}, ${input.text}, ${color})`;
    }),
  getMessages: procedure.query(async () => {
    const messages = await sql`SELECT * FROM chat ORDER BY id DESC LIMIT 100`;
    return messages;
  }),
});
