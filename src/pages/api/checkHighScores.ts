import sql from "@/utils/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data =
    await sql`SELECT * FROM leader_board ORDER BY score DESC LIMIT 20`;
  res.status(200).json({ data });
}
