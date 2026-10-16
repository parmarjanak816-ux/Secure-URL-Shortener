// Prisma's error classes (connection failures, query crashes, etc.) all have
// a `.name` starting with "PrismaClient". We never want to leak those details
// to the client, so we detect them and return a safe, generic response.
export const isDatabaseError = (error: unknown): boolean =>
  error instanceof Error && error.name.startsWith('PrismaClient');
