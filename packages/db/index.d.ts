import { PrismaClient } from './generated/prisma';

declare const globalForPrisma: {
  prisma: PrismaClient | undefined;
};

export declare const db: PrismaClient;
export declare const prisma: PrismaClient;
export { PrismaClient };
export default db;
