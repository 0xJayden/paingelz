// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import sql from "@/utils/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const parsedBody = JSON.parse(req.body);
  const { name, score } = parsedBody;

  await sql`INSERT INTO leader_board (score, name) VALUES (${score}, ${name})`;

  res.status(200).json({ msg: "Score posted!" });
}
