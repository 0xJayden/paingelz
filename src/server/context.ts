import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

export const createContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts;

  return {
    req,
  };
};

export type Context = ReturnType<typeof createContext>;
